import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { redeemCoupon } from "@/lib/coupon-service";
import { getAllTicketTiers } from "@/lib/ticket-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated session server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with Google before registering." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      fullName,
      phone,
      organization,
      designation,
      linkedin,
      referral,
    } = body;

    // 3. Validate presence of Razorpay parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment verification parameters." },
        { status: 400 }
      );
    }

    // 4. Validate presence of required form fields
    if (!fullName?.trim() || !phone?.trim() || !organization?.trim()) {
      return NextResponse.json(
        { error: "Missing required registration fields (name, phone, organization)." },
        { status: 400 }
      );
    }

    // 5. Load RAZORPAY_KEY_SECRET from environment (never from client)
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keySecret || !keyId) {
      return NextResponse.json(
        { error: "Payment gateway credentials are not configured on the server." },
        { status: 500 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. CRITICAL SECURITY: Verify Razorpay HMAC-SHA256 Signature
    // ─────────────────────────────────────────────────────────────────────────
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[Security] Razorpay signature mismatch — possible tampered request.");
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // 7. Guard against double-registration (same email cannot register twice)
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

    // 8. Fetch payment and order details from Razorpay API to extract metadata notes
    let paymentMethod = "online";
    let utrNumber: string | null = null;
    let tierId = "early_bird";
    let tierName = "Early Bird";
    let couponCode: string | null = null;
    let discountAmount = 0;
    let amountPaid = 300;

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    try {
      // Fetch Payment Info
      const rzpRes = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (rzpRes.ok) {
        const paymentData = await rzpRes.json();
        paymentMethod = paymentData.method || "online";
        if (paymentData.amount) {
          amountPaid = paymentData.amount / 100;
        }

        if (paymentData.acquirer_data) {
          utrNumber =
            paymentData.acquirer_data.upi_transaction_id ||
            paymentData.acquirer_data.rrn ||
            paymentData.acquirer_data.bank_transaction_id ||
            paymentData.acquirer_data.arn ||
            null;
        }
      }

      // Fetch Order Info for notes
      const orderRes = await fetch(
        `https://api.razorpay.com/v1/orders/${razorpay_order_id}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
          signal: AbortSignal.timeout(8000),
        }
      );

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.notes) {
          tierId = orderData.notes.tier_id || tierId;
          tierName = orderData.notes.tier_name || tierName;
          if (orderData.notes.coupon_code && orderData.notes.coupon_code !== "NONE") {
            couponCode = orderData.notes.coupon_code;
          }
          if (orderData.notes.discount_amount) {
            discountAmount = Number(orderData.notes.discount_amount) || 0;
          }
          if (orderData.notes.final_price) {
            amountPaid = Number(orderData.notes.final_price) || amountPaid;
          }
        }
      }
    } catch (rzpFetchErr) {
      console.warn("[Razorpay] Could not fetch extra payment/order details:", rzpFetchErr);
    }

    // 9. Insert confirmed registration into Supabase
    const registrationRecord = {
      full_name: fullName.trim(),
      email: user.email,
      phone: phone.trim(),
      organization: organization.trim(),
      designation: designation?.trim() || "Student",
      linkedin: linkedin?.trim() || null,
      referral: referral?.trim() || null,
      user_id: user.id,
      ticket_status: "confirmed",
      payment_id: razorpay_payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      utr_number: utrNumber,
      payment_method: paymentMethod,
      tier_id: tierId,
      tier_name: tierName,
      coupon_code: couponCode,
      discount_amount: discountAmount,
      amount_paid: amountPaid,
    };

    const { data: insertedData, error: insertError } = await supabase
      .from("registrations")
      .insert(registrationRecord)
      .select("id")
      .single();

    if (insertError) {
      console.error("[Supabase] Registration insert failed:", insertError);
      return NextResponse.json(
        { error: "Failed to save your registration. Please contact support with payment ID: " + razorpay_payment_id },
        { status: 500 }
      );
    }

    // 10. Redeem coupon if one was used
    if (couponCode) {
      try {
        await redeemCoupon(couponCode, {
          email: user.email,
          fullName: fullName.trim(),
          phone: phone.trim(),
          organization: organization.trim(),
          registrationId: insertedData?.id,
          tierId,
          amountPaid,
        });
      } catch (cpnErr) {
        console.warn("Coupon redemption recording error:", cpnErr);
      }
    }

    // Trigger tier status check (updates tiers dynamically if sold out)
    try {
      await getAllTicketTiers();
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      utrNumber,
      paymentMethod,
      tierName,
      amountPaid,
    });
  } catch (error: unknown) {
    console.error("[Verify] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred during payment verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
