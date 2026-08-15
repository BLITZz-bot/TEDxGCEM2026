import { NextResponse } from "next/server";
import { getActiveTicketTier, getAllTicketTiers } from "@/lib/ticket-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeTier = await getActiveTicketTier();
    const allTiers = await getAllTicketTiers();

    // Sanitize data for public view: Never leak sold counts or internal capacity numbers to public
    const publicTiers = allTiers.map((t) => ({
      id: t.id,
      name: t.name,
      tag: t.tag,
      description: t.description,
      price: t.price,
      discount_price: t.discount_price,
      allow_coupons: t.allow_coupons,
      status: t.status,
      sort_order: t.sort_order,
    }));

    const sanitizedActiveTier = {
      id: activeTier.id,
      name: activeTier.name,
      tag: activeTier.tag,
      description: activeTier.description,
      price: activeTier.price,
      discount_price: activeTier.discount_price,
      allow_coupons: activeTier.allow_coupons,
      status: activeTier.status,
    };

    return NextResponse.json({
      activeTier: sanitizedActiveTier,
      tiers: publicTiers,
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json({ error: "Failed to fetch ticket tiers" }, { status: 500 });
  }
}
