export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify platform admin
    const { data: isAdmin } = await supabase.rpc("is_platform_admin");
    if (!isAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const { campaignId } = await request.json();
    if (!campaignId) return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });

    // Get campaign
    const { data: campaign, error: cErr } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (cErr || !campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    if (campaign.status === "sent") return NextResponse.json({ error: "Already sent" }, { status: 400 });

    // Mark as sending
    await supabase.from("email_campaigns").update({ status: "sending" }).eq("id", campaignId);

    // Get recipients based on audience
    let query = supabase.from("shop_database").select("email, name");
    if (campaign.audience === "prospects_only") query = query.eq("status", "prospect");
    else if (campaign.audience === "contacted") query = query.eq("status", "contacted");
    else if (campaign.audience === "interested") query = query.eq("status", "interested");
    else if (campaign.audience === "signed_up") query = query.eq("status", "signed_up");
    // all_prospects = entire database

    const { data: recipients } = await query;
    const emails = (recipients || []).filter((r: any) => r.email).map((r: any) => r.email);

    // Remove unsubscribes
    const { data: unsubs } = await supabase.from("email_unsubscribes").select("email");
    const unsubEmails = new Set((unsubs || []).map((u: any) => u.email.toLowerCase()));
    const validEmails = emails.filter((e: string) => !unsubEmails.has(e.toLowerCase()));

    if (validEmails.length === 0) {
      await supabase.from("email_campaigns").update({ status: "sent", sent_count: 0, sent_at: new Date().toISOString() }).eq("id", campaignId);
      return NextResponse.json({ sent: 0 });
    }

    // Send emails in batches
    let sentCount = 0;
    const batchSize = 50;
    const unsubUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://cabinetshop.io"}/api/unsubscribe`;

    for (let i = 0; i < validEmails.length; i += batchSize) {
      const batch = validEmails.slice(i, i + batchSize);
      const promises = batch.map(async (email: string) => {
        try {
          const personalHtml = campaign.html
            .replace(/{unsubscribe_url}/g, `${unsubUrl}?email=${encodeURIComponent(email)}`);

          await getResend().emails.send({
            from: "CabinetShop.io <hello@cabinetshop.io>",
            to: email,
            subject: campaign.subject,
            html: personalHtml,
          });

          // Log sent event
          await supabase.from("campaign_events").insert({
            campaign_id: campaignId,
            email,
            event: "sent",
          });

          sentCount++;
        } catch (err) {
          // Log bounce/error
          await supabase.from("campaign_events").insert({
            campaign_id: campaignId,
            email,
            event: "bounce",
            metadata: { error: String(err) },
          });
        }
      });

      await Promise.all(promises);
    }

    // Update campaign
    await supabase.from("email_campaigns").update({
      status: "sent",
      sent_count: sentCount,
      sent_at: new Date().toISOString(),
    }).eq("id", campaignId);

    // Log activity
    await supabase.from("platform_activity").insert({
      action: "campaign_sent",
      actor_email: user.email,
      target: campaign.subject,
      meta: { campaign_id: campaignId, sent_count: sentCount },
    });

    // Update contacted prospects
    if (campaign.audience !== "all_users") {
      const contactedEmails = validEmails.map((e: string) => e.toLowerCase());
      for (const email of contactedEmails) {
        await supabase
          .from("shop_database")
          .update({ status: "contacted", last_contacted_at: new Date().toISOString() })
          .eq("email", email)
          .eq("status", "prospect");
      }
    }

    return NextResponse.json({ sent: sentCount, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
