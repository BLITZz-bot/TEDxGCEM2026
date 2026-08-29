import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllTicketTiers, updateTierCapacity, updateTierPrice, updateTierStatus } from "@/lib/ticket-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";
    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const tiers = await getAllTicketTiers();
    return NextResponse.json({ tiers });
  } catch (error) {
    console.error("Admin tickets GET error:", error);
    return NextResponse.json({ error: "Failed to load admin ticket tiers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";
    if (!user || user.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { tierId, action, status, capacity, price, discountPrice, allowCoupons } = body;

    if (!tierId) {
      return NextResponse.json({ error: "tierId is required" }, { status: 400 });
    }

    if (action === "update_status" && status) {
      await updateTierStatus(tierId, status, true);
    } else if (action === "update_capacity" && typeof capacity === "number") {
      await updateTierCapacity(tierId, capacity);
    } else if (action === "update_price" && typeof price === "number") {
      await updateTierPrice(
        tierId,
        price,
        discountPrice !== undefined ? discountPrice : undefined,
        allowCoupons !== undefined ? Boolean(allowCoupons) : undefined,
        typeof capacity === "number" ? capacity : undefined
      );
    } else {
      return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    }

    const updatedTiers = await getAllTicketTiers();
    return NextResponse.json({ success: true, tiers: updatedTiers });
  } catch (error) {
    console.error("Admin tickets POST error:", error);
    return NextResponse.json({ error: "Failed to update ticket tier" }, { status: 500 });
  }
}
