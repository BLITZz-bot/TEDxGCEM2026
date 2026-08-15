import { NextResponse } from "next/server";
import { getActiveTicketTier } from "@/lib/ticket-service";
import { validateCoupon } from "@/lib/coupon-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ valid: false, error: "Please provide a valid coupon code." }, { status: 400 });
    }

    const activeTier = await getActiveTicketTier();

    if (!activeTier.allow_coupons) {
      return NextResponse.json(
        {
          valid: false,
          error: "Promo codes cannot be applied to Early Bird passes as they are already pre-discounted.",
        },
        { status: 400 }
      );
    }

    const result = await validateCoupon(
      code,
      activeTier.id,
      activeTier.price,
      activeTier.discount_price
    );

    if (!result.valid || !result.coupon) {
      return NextResponse.json(
        { valid: false, error: result.error || "Invalid or expired coupon code." },
        { status: 400 }
      );
    }

    const originalPrice = activeTier.price;
    const discountAmount = result.discountAmount ?? 100;
    const finalAmount = result.finalAmount ?? Math.max(0, originalPrice - discountAmount);
    const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      originalPrice,
      discountAmount,
      finalAmount,
      discountPercentage,
      tierName: activeTier.name,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
