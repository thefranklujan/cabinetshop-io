export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: isAdmin } = await supabase.rpc("is_platform_admin");
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = params;

    const { data: campaign } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: events } = await supabase
      .from("campaign_events")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    const evts = events || [];

    const sentEmails = new Set(evts.filter(e => e.event === "sent").map(e => e.email));
    const openedEmails = new Set(evts.filter(e => e.event === "open").map(e => e.email));
    const clickedEmails = new Set(evts.filter(e => e.event === "click").map(e => e.email));
    const failedEmails = new Set(evts.filter(e => e.event === "bounce").map(e => e.email));

    const totalClicks = evts.filter(e => e.event === "click").length;

    // Click breakdown by URL
    const clicksByUrl: Record<string, number> = {};
    for (const e of evts.filter(e => e.event === "click" && e.metadata?.url)) {
      const url = e.metadata.url;
      clicksByUrl[url] = (clicksByUrl[url] || 0) + 1;
    }

    // Timeline: events grouped by hour
    const timeline: Record<string, { opens: number; clicks: number }> = {};
    for (const e of evts) {
      if (e.event !== "open" && e.event !== "click") continue;
      const hour = new Date(e.created_at).toISOString().slice(0, 13) + ":00";
      if (!timeline[hour]) timeline[hour] = { opens: 0, clicks: 0 };
      if (e.event === "open") timeline[hour].opens++;
      if (e.event === "click") timeline[hour].clicks++;
    }

    // Recent activity
    const recentActivity = evts.slice(0, 50).map(e => ({
      email: e.email,
      event: e.event,
      metadata: e.metadata?.url || null,
      time: e.created_at,
    }));

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        subject: campaign.subject,
        audience: campaign.audience,
        status: campaign.status,
        sentAt: campaign.sent_at,
        sentCount: campaign.sent_count,
      },
      metrics: {
        sent: sentEmails.size,
        opened: openedEmails.size,
        clicked: clickedEmails.size,
        failed: failedEmails.size,
        totalClicks,
        openRate: sentEmails.size > 0 ? Math.round((openedEmails.size / sentEmails.size) * 100) : 0,
        clickRate: sentEmails.size > 0 ? Math.round((clickedEmails.size / sentEmails.size) * 100) : 0,
        clickToOpenRate: openedEmails.size > 0 ? Math.round((clickedEmails.size / openedEmails.size) * 100) : 0,
      },
      clicksByUrl: Object.entries(clicksByUrl).sort(([, a], [, b]) => b - a),
      timeline: Object.entries(timeline).sort(([a], [b]) => a.localeCompare(b)),
      recentActivity,
      emailLists: {
        sent: Array.from(sentEmails),
        opened: Array.from(openedEmails),
        clicked: Array.from(clickedEmails),
        bounced: Array.from(failedEmails),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
