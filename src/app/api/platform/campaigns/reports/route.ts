export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: isAdmin } = await supabase.rpc("is_platform_admin");
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get all campaign events
    const { data: events } = await supabase
      .from("campaign_events")
      .select("email, event, created_at, metadata")
      .order("created_at", { ascending: false });

    const evts = events || [];

    // Aggregate per email
    const emailMap: Record<string, {
      sent: number; opened: boolean; clicked: boolean;
      lastEvent: string; lastEventTime: string;
    }> = {};

    for (const e of evts) {
      if (!emailMap[e.email]) {
        emailMap[e.email] = { sent: 0, opened: false, clicked: false, lastEvent: e.event, lastEventTime: e.created_at };
      }
      const rec = emailMap[e.email];
      if (e.event === "sent") rec.sent++;
      if (e.event === "open") rec.opened = true;
      if (e.event === "click") rec.clicked = true;
    }

    // Get shop info for these emails
    const emails = Object.keys(emailMap);
    const { data: shops } = await supabase
      .from("shop_database")
      .select("email, name, state")
      .in("email", emails.length > 0 ? emails : ["__none__"]);

    const shopMap: Record<string, { name: string; state: string | null }> = {};
    for (const s of (shops || [])) {
      if (s.email) shopMap[s.email] = { name: s.name, state: s.state };
    }

    // Get unsubscribed
    const { data: unsubs } = await supabase
      .from("email_unsubscribes")
      .select("email");
    const unsubSet = new Set((unsubs || []).map(u => u.email));

    const recipients = Object.entries(emailMap).map(([email, r]) => ({
      email,
      sent: r.sent,
      opened: r.opened,
      clicked: r.clicked,
      lastEvent: r.lastEvent,
      lastEventTime: r.lastEventTime,
      shopName: shopMap[email]?.name || null,
      state: shopMap[email]?.state || null,
      unsubscribed: unsubSet.has(email),
    }));

    recipients.sort((a, b) => a.email.localeCompare(b.email));

    const totalSent = recipients.length;
    const totalOpened = recipients.filter(r => r.opened).length;
    const totalClicked = recipients.filter(r => r.clicked).length;
    const totalUnsubscribed = recipients.filter(r => r.unsubscribed).length;

    return NextResponse.json({
      recipients,
      stats: {
        totalSent,
        totalOpened,
        totalClicked,
        totalUnsubscribed,
        openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
