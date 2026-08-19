import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { getActiveTicketTier, getTierSoldCounts } from "@/lib/ticket-service";
import { validateCoupon } from "@/lib/coupon-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify user authentication server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Google before registering." },
        { status: 401 }
      );
    }

    // 2. Check registrations are open in settings
    const { getSettings } = await import("@/lib/settings-service");
    const settings = await getSettings();
    if (settings.reveal_register === false) {
      return NextResponse.json(
        { error: "Registrations are currently closed. Please check back soon." },
        { status: 403 }
      );
    }

    // 3. Parse request body for quantity and coupon
    let body: { couponCode?: string; quantity?: number } = {};
    try {
      body = await request.json();
    } catch {
      // no body passed
    }

    const quantity = Math.max(1, Math.min(10, Math.floor(Number(body.quantity) || 1)));

    // 4. Validate active ticket tier and real-time capacity check
    const activeTier = await getActiveTicketTier();
    const soldCounts = await getTierSoldCounts();
    const currentSold = soldCounts[activeTier.id] || 0;
    const remainingCapacity = Math.max(0, activeTier.total_capacity - currentSold);

    if (activeTier.status === "closed") {
      return NextResponse.json(
        { error: "Ticket registrations for this tier are currently paused by the organizer." },
        { status: 403 }
      );
    }

    if (activeTier.status === "sold_out" || currentSold >= activeTier.total_capacity) {
      return NextResponse.json(
        { error: `The ${activeTier.name} pass has reached full capacity! Please refresh to view available tickets.` },
        { status: 409 }
      );
    }

    if (quantity > remainingCapacity) {
      return NextResponse.json(
        {
          error: `Only ${remainingCapacity} ticket${remainingCapacity === 1 ? "" : "s"} remaining for ${activeTier.name}. Please select ${remainingCapacity} or fewer tickets.`,
        },
        { status: 409 }
      );
    }

    // 5. Calculate base price & process coupon if provided (Promo codes allowed ONLY for single-ticket registrations)
    const rawCoupon = body.couponCode?.trim().toUpperCase();
    const baseTotalInr = activeTier.price * quantity;
    let finalPriceInr = baseTotalInr;
    let appliedCouponCode: string | null = null;
    let discountAmountInr = 0;

    if (rawCoupon) {
      // Strict rule: promo coupons are strictly for individual (1 ticket) registrations
      if (quantity > 1) {
        return NextResponse.json(
          { error: "Promo discount codes are valid only for individual single-ticket registrations (1 ticket)." },
          { status: 400 }
        );
      }

      if (!activeTier.allow_coupons) {
        return NextResponse.json(
          { error: "Promo codes cannot be applied to Early Bird passes as they are already pre-discounted." },
          { status: 400 }
        );
      }

      const couponCheck = await validateCoupon(
        rawCoupon,
        activeTier.id,
        activeTier.price,
        activeTier.discount_price
      );

      if (!couponCheck.valid || !couponCheck.coupon) {
        return NextResponse.json(
          { error: couponCheck.error || "Invalid or expired coupon code." },
          { status: 400 }
        );
      }

      appliedCouponCode = couponCheck.coupon.code;
      discountAmountInr = couponCheck.discountAmount ?? 100;
      finalPriceInr = couponCheck.finalAmount ?? Math.max(0, baseTotalInr - discountAmountInr);
    }

    const priceInPaise = Math.round(finalPriceInr * 100);

    // 6. Validate Razorpay keys
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("xxxxxxxxxxxx")) {
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact the organizers." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // 7. Create Razorpay order — amount is always server-controlled
    const order = await razorpay.orders.create({
      amount: priceInPaise,
      currency: "INR",
      receipt: `tedx_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        user_email: user.email,
        tier_id: activeTier.id,
        tier_name: activeTier.name,
        ticket_count: String(quantity),
        quantity: String(quantity),
        unit_price: String(activeTier.price),
        original_price: String(baseTotalInr),
        final_price: String(finalPriceInr),
        coupon_code: appliedCouponCode || "NONE",
        discount_amount: String(discountAmountInr),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      tierId: activeTier.id,
      tierName: activeTier.name,
      quantity,
      unitPrice: activeTier.price,
      finalPrice: finalPriceInr,
      originalPrice: baseTotalInr,
      discountAmount: discountAmountInr,
    });
  } catch (error: unknown) {
    console.error("Razorpay Order Creation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment order. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
