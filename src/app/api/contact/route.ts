export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Same posture as /api/early-access: the SECURITY DEFINER function owns the
// write, and success is only reported when the database confirmed it.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const s = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";
  const email = s(body.email, 320);
  const message = s(body.message, 5000);
  if (!email || !message) {
    return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("submit_contact", {
    p_name: s(body.name, 200) || null,
    p_shop_name: s(body.shopName, 200) || null,
    p_email: email,
    p_body: message,
  });

  if (error) {
    console.error("contact submit failed:", error.message);
    const friendly = error.message.includes("too many requests")
      ? "Too many messages from this email. Please try again in an hour."
      : error.message.includes("invalid")
        ? "Please check your email address and message and try again."
        : "We could not save your message. Please email hello@cabinetshop.io directly.";
    return NextResponse.json({ error: friendly }, { status: error.message.includes("invalid") ? 400 : 502 });
  }

  return NextResponse.json({ success: true });
}
