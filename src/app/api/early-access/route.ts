export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopName, ownerName, email, phone, city, state, employeeCount, website } = body;

    if (!shopName || !email) {
      return NextResponse.json({ error: "Shop name and email are required" }, { status: 400 });
    }

    const supabase = createClient();

    // Check if this email already exists in shop_database
    const { data: existing } = await supabase
      .from("shop_database")
      .select("id, status")
      .eq("email", email)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing prospect to "interested"
      await supabase
        .from("shop_database")
        .update({
          status: "interested",
          owner_name: ownerName || existing[0].owner_name,
          phone: phone || null,
          city: city || null,
          state: state || null,
          website: website || null,
          employee_count: employeeCount ? parseInt(employeeCount) || null : null,
          notes: `Early access request. Team size: ${employeeCount || "not specified"}`,
        })
        .eq("id", existing[0].id);
    } else {
      // Create new prospect as "interested"
      await supabase.from("shop_database").insert({
        name: shopName,
        owner_name: ownerName || null,
        email,
        phone: phone || null,
        city: city || null,
        state: state || null,
        website: website || null,
        source: "early_access",
        status: "interested",
        employee_count: employeeCount ? parseInt(employeeCount) || null : null,
        notes: `Early access request. Team size: ${employeeCount || "not specified"}`,
      });
    }

    // Log activity
    await supabase.from("platform_activity").insert({
      action: "early_access_request",
      actor_email: email,
      target: shopName,
      meta: { city, state, employeeCount },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
