export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lead capture goes through submit_early_access(), a SECURITY DEFINER function
// that validates, rate-limits, and owns the write. This route returns success
// ONLY when the database confirmed the write — the old version swallowed every
// error and told dropped leads they were on the list.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const s = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const shopName = s(body.shopName, 200);
  const email = s(body.email, 320);
  if (!shopName || !email) {
    return NextResponse.json({ error: "Shop name and email are required" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("submit_early_access", {
    p_shop_name: shopName,
    p_owner_name: s(body.ownerName, 200) || null,
    p_email: email,
    p_phone: s(body.phone, 50) || null,
    p_city: s(body.city, 100) || null,
    p_state: s(body.state, 50) || null,
    p_employee_count: s(body.employeeCount, 20) || null,
    p_website: s(body.website, 300) || null,
  });

  if (error) {
    console.error("early-access submit failed:", error.message);
    const friendly = error.message.includes("too many requests")
      ? "Too many requests from this email. Please try again in an hour."
      : error.message.includes("invalid")
        ? "Please check the shop name and email and try again."
        : "We could not save your request. Please email hello@cabinetshop.io and we will set you up directly.";
    return NextResponse.json({ error: friendly }, { status: error.message.includes("invalid") ? 400 : 502 });
  }

  return NextResponse.json({ success: true });
}
