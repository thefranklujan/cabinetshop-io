export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTrackingSignature } from "@/lib/tracking-sig";

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get("c");
  const email = request.nextUrl.searchParams.get("e");
  const url = request.nextUrl.searchParams.get("url");
  const sig = request.nextUrl.searchParams.get("sig");

  if (!campaignId || !email || !sig) {
    return NextResponse.redirect("https://cabinetshop.io");
  }

  const valid = verifyTrackingSignature({ c: campaignId, e: email, url: url || "" }, sig);
  if (!valid) {
    return NextResponse.redirect("https://cabinetshop.io");
  }

  try {
    const supabase = createClient();
    await supabase.from("campaign_events").insert({
      campaign_id: campaignId,
      email: decodeURIComponent(email),
      event: "click",
      metadata: { url },
    });

    await supabase.rpc("increment_campaign_clicks", { cid: campaignId });
  } catch {
    console.error("Failed to record click event");
  }

  let redirect = url || "https://cabinetshop.io";
  try {
    const parsed = new URL(redirect);
    if (!["http:", "https:"].includes(parsed.protocol)) redirect = "https://cabinetshop.io";
  } catch {
    redirect = "https://cabinetshop.io";
  }
  return NextResponse.redirect(redirect);
}
