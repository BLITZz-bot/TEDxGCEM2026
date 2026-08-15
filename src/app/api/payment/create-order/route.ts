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

    // 3. Prevent duplicate registrations — check if user already has a confirmed registration
    const { data: existing } = await supabase
      .from("registrations")
      .select("id, ticket_status")
      .eq("email", user.email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You have already registered for TEDxGCEM 2026. Visit 'Get My Pass' to retrieve your pass." },
        { status: 409 }
      );
    }

    // 4. Validate active ticket tier and real-time capacity check
    const activeTier = await getActiveTicketTier();
    const soldCounts = await getTierSoldCounts();
    const currentSold = soldCounts[activeTier.id] || 0;

    if (activeTier.status === "closed") {
      return NextResponse.json(
        { error: "Ticket registrations for this tier are currently paused by the organizer." },
        { status: 403 }
      );
    }

    if (activeTier.status === "sold_out" || currentSold >= activeTier.total_capacity) {
      return NextResponse.json(
        { error: `The ${activeTier.name} pass has just reached full capacity! Please refresh to view available tickets.` },
        { status: 409 }
      );
    }

    // 5. Calculate base price & process coupon if provided
    let body: { couponCode?: string } = {};
    try {
      body = await request.json();
    } catch {
      // no body passed
    }

    const rawCoupon = body.couponCode?.trim().toUpperCase();
    let finalPriceInr = activeTier.price;
    let appliedCouponCode: string | null = null;
    let discountAmountInr = 0;

    if (rawCoupon) {
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
      finalPriceInr = couponCheck.finalAmount ?? Math.max(0, activeTier.price - discountAmountInr);
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
        original_price: String(activeTier.price),
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
      finalPrice: finalPriceInr,
      originalPrice: activeTier.price,
      discountAmount: discountAmountInr,
    });
  } catch (error: unknown) {
    console.error("Razorpay Order Creation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment order. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
