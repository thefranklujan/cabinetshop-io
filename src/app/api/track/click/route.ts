export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("c");
  const email = request.nextUrl.searchParams.get("e");
  const url = request.nextUrl.searchParams.get("url");

  if (campaignId && email) {
    try {
      const supabase = createClient();
      await supabase.from("campaign_events").insert({
        campaign_id: campaignId,
        email: decodeURIComponent(email),
        event: "click",
        metadata: { url },
      });

      // Increment click count
      await supabase.rpc("increment_campaign_clicks", { cid: campaignId });
    } catch {}
  }

  // Redirect to the actual URL
  return NextResponse.redirect(url || "https://cabinetshop.io");
}
