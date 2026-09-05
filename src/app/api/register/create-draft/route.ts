import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { getActiveTicketTier } from "@/lib/ticket-service";
import { validateCoupon } from "@/lib/coupon-service";
import { saveDraft } from "@/lib/draft-store";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`draft_${ip}`, 10, 15 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many draft creation requests. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with Google." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      organization,
      designation = "Student",
      linkedin = "",
      referral = "",
      tierId,
      quantity = 1,
      couponCode = null,
      attendees = [],
    } = body;

    if (!fullName || !email || !phone || !tierId) {
      return NextResponse.json(
        { error: "Missing required attendee or ticket fields." },
        { status: 400 }
      );
    }

    // Server-Side Tamper-Proof Price Calculation
    // Never trust client-provided amount; fetch active tier and validate coupon server-side
    const activeTier = await getActiveTicketTier();
    const cleanQty = Math.max(1, Math.min(10, Number(quantity) || 1));
    const baseAmount = activeTier.price * cleanQty;

    let verifiedDiscount = 0;
    let validatedCouponCode: string | null = null;

    if (couponCode && cleanQty === 1 && activeTier.allow_coupons) {
      const couponCheck = await validateCoupon(
        couponCode,
        activeTier.id,
        activeTier.price,
        activeTier.discount_price
      );
      if (couponCheck.valid && couponCheck.coupon) {
        verifiedDiscount = couponCheck.discountAmount ?? 100;
        validatedCouponCode = couponCheck.coupon.code;
      }
    }

    const verifiedFinalAmount = Math.max(0, baseAmount - verifiedDiscount);

    const draftId = `draft_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
    const authHandoffToken = crypto.randomBytes(24).toString("hex");
    const authTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await saveDraft({
      id: draftId,
      user_id: user.id,
      auth_handoff_token: authHandoffToken,
      auth_token_expires_at: authTokenExpiresAt,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      buyer_email: user.email?.toLowerCase() || email.trim().toLowerCase(),
      phone: phone.trim(),
      organization: organization?.trim() || "N/A",
      designation: designation?.trim() || "Student",
      linkedin: linkedin?.trim() || "",
      referral: referral?.trim() || "",
      tier_id: activeTier.id,
      tier_name: activeTier.name,
      quantity: cleanQty,
      amount: verifiedFinalAmount,
      coupon_code: validatedCouponCode,
      discount_amount: verifiedDiscount,
      attendees_json: Array.isArray(attendees)
        ? attendees.map((a: { fullName?: string; email?: string; phone?: string; organization?: string; designation?: string; linkedin?: string; referral?: string }) => ({
            ...a,
            fullName: (a.fullName || "").trim(),
            email: (a.email || "").trim().toLowerCase(),
            phone: (a.phone || "").trim(),
            organization: (a.organization || "").trim() || "GCEM",
            designation: (a.designation || "").trim() || "Student",
          }))
        : [],
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      draftId,
      authToken: authHandoffToken,
      expiresAt: authTokenExpiresAt,
      // Return server-authoritative tier info so client can sync its state
      tierId: activeTier.id,
      tierName: activeTier.name,
      tierPrice: activeTier.price,
      tierStatus: activeTier.status,
    });
  } catch (error: unknown) {
    console.error("[create-draft] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
