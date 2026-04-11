export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 1x1 transparent GIF
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("c");
  const email = request.nextUrl.searchParams.get("e");

  if (campaignId && email) {
    try {
      const supabase = createClient();
      await supabase.from("campaign_events").insert({
        campaign_id: campaignId,
        email: decodeURIComponent(email),
        event: "open",
      });

      // Increment open count
      await supabase.rpc("increment_campaign_opens", { cid: campaignId });
    } catch {}
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
