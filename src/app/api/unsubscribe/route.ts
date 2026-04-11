export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return new NextResponse(
      "<html><body style='background:#0a0a0a;color:#fafaf7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh'><div style='text-align:center'><h1>Missing email</h1></div></body></html>",
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const supabase = createClient();
  await supabase.from("email_unsubscribes").upsert({ email: email.toLowerCase() }, { onConflict: "email" });

  return new NextResponse(
    `<html><body style='background:#0a0a0a;color:#fafaf7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh'>
      <div style='text-align:center;max-width:400px'>
        <h1 style='font-size:24px;font-weight:800;margin-bottom:12px'>Unsubscribed</h1>
        <p style='color:#a3a3a3;font-size:14px'>You have been removed from CabinetShop.io emails. You will not receive any further marketing messages.</p>
        <a href='https://cabinetshop.io' style='color:#f59e0b;display:inline-block;margin-top:24px;font-size:14px'>Visit CabinetShop.io</a>
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
