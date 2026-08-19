import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { sendRegistrationConfirmationEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/webhook
 *
 * Razorpay sends a server-to-server event ping here directly
 * whenever a payment is captured — even if the user's browser crashed.
 *
 * Security: Validates the X-Razorpay-Signature HMAC-SHA256 header
 * using RAZORPAY_WEBHOOK_SECRET to authenticate the request.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  // 1. Read the raw body as text (required for HMAC signature verification)
  const rawBody = await request.text();

  // 2. Validate the Razorpay webhook signature
  const razorpaySignature = request.headers.get("x-razorpay-signature");
  if (!razorpaySignature) {
    console.warn("[Webhook] Missing x-razorpay-signature header.");
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    console.error("[Webhook] Signature mismatch — unauthorized webhook call.");
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });
  }

  // 3. Parse the event payload
  let event: { event: string; payload?: { payment?: { entity?: Record<string, unknown> }; order?: { entity?: Record<string, unknown> } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const eventType = event?.event;
  console.log(`[Webhook] Received event: ${eventType}`);

  // 4. Only handle payment.captured events
  if (eventType !== "payment.captured" && eventType !== "order.paid") {
    // Acknowledge other event types without processing
    return NextResponse.json({ received: true, processed: false });
  }

  try {
    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    const razorpayPaymentId = String(paymentEntity?.id || "");
    const razorpayOrderId = String(paymentEntity?.order_id || orderEntity?.id || "");
    const amountPaid = Number(paymentEntity?.amount || 0) / 100; // convert paise to INR
    const paymentMethod = String(paymentEntity?.method || "online");

    if (!razorpayPaymentId || !razorpayOrderId) {
      console.warn("[Webhook] Missing payment or order ID in payload.");
      return NextResponse.json({ received: true, processed: false });
    }

    const supabase = await createClient();

    // 5. Check if this payment was already processed (prevent duplicate records)
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("razorpay_payment_id", razorpayPaymentId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[Webhook] Payment ${razorpayPaymentId} already processed. Skipping.`);
      return NextResponse.json({ received: true, processed: false, reason: "already_processed" });
    }

    // 6. Fetch order notes from Razorpay API to retrieve attendee metadata
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("[Webhook] Razorpay API credentials not configured.");
      return NextResponse.json({ received: true, processed: false });
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpayOrderId}`, {
      headers: { Authorization: `Basic ${authHeader}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!orderRes.ok) {
      console.warn(`[Webhook] Could not fetch order ${razorpayOrderId} from Razorpay API.`);
      // Still acknowledge the webhook so Razorpay doesn't retry infinitely
      return NextResponse.json({ received: true, processed: false });
    }

    const orderData = await orderRes.json();
    const notes = orderData?.notes || {};

    const userEmail = String(notes.user_email || "");
    const tierId = String(notes.tier_id || "early_bird");
    const tierName = String(notes.tier_name || "Early Bird");

    if (!userEmail) {
      console.warn("[Webhook] No user email found in order notes. Cannot create registration.");
      return NextResponse.json({ received: true, processed: false });
    }

    // 7. Insert a fallback registration record for the buyer
    const { data: insertedData, error: insertError } = await supabase
      .from("registrations")
      .insert([
        {
          full_name: userEmail.split("@")[0],
          email: userEmail,
          buyer_email: userEmail,
          phone: "N/A",
          organization: "GCEM",
          designation: "Student",
          ticket_status: "confirmed",
          payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          payment_method: paymentMethod,
          amount_paid: amountPaid,
          tier_id: tierId,
          tier_name: tierName,
          ticket_count: 1,
        },
      ])
      .select("id");

    if (insertError) {
      console.error("[Webhook] Registration insert failed:", insertError);
      return NextResponse.json({ received: true, processed: false });
    }

    console.log(`[Webhook] ✅ Fallback registration created for ${userEmail} via webhook.`);

    // 8. Send notification email to buyer
    try {
      await sendRegistrationConfirmationEmail({
        buyerEmail: userEmail,
        buyerName: userEmail.split("@")[0],
        attendees: [
          {
            id: insertedData?.[0]?.id || "TEDX-PASS",
            fullName: userEmail.split("@")[0],
            email: userEmail,
            phone: "N/A",
            organization: "GCEM",
            designation: "Student",
          },
        ],
        tierName,
        amountPaid,
        razorpayPaymentId,
        razorpayOrderId,
      });
    } catch (mailErr) {
      console.warn("[Webhook] Email send error:", mailErr);
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (err) {
    console.error("[Webhook] Unhandled error:", err);
    // Always return 200 to Razorpay so it doesn't keep retrying
    return NextResponse.json({ received: true, processed: false });
  }
}
