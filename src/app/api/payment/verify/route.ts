import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

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
    //    This prevents anyone from faking a successful payment by posting
    //    random payment IDs. If signature doesn't match → reject immediately.
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

    // 8. Fetch additional payment details from Razorpay API (UTR, method, etc.)
    let paymentMethod = "online";
    let utrNumber: string | null = null;

    try {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const rzpRes = await fetch(
        `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
        {
          headers: { Authorization: `Basic ${authHeader}` },
          // Timeout guard — don't block DB insert if Razorpay is slow
          signal: AbortSignal.timeout(8000),
        }
      );

      if (rzpRes.ok) {
        const paymentData = await rzpRes.json();
        paymentMethod = paymentData.method || "online";

        // Extract UTR / transaction reference depending on payment method
        if (paymentData.acquirer_data) {
          utrNumber =
            paymentData.acquirer_data.upi_transaction_id ||  // UPI
            paymentData.acquirer_data.rrn ||                 // UPI (alternate)
            paymentData.acquirer_data.bank_transaction_id || // Net Banking
            paymentData.acquirer_data.arn ||                 // Card
            null;
        }
      }
    } catch (rzpFetchErr) {
      // Non-blocking — UTR is a bonus detail, not required for registration
      console.warn("[Razorpay] Could not fetch payment details:", rzpFetchErr);
    }

    // 9. Insert confirmed registration into Supabase
    const { error: insertError } = await supabase.from("registrations").insert({
      full_name: fullName.trim(),
      email: user.email,
      phone: phone.trim(),
      organization: organization.trim(),
      designation: designation?.trim() || "Student",
      linkedin: linkedin?.trim() || null,
      referral: referral?.trim() || null,
      user_id: user.id,
      ticket_status: "confirmed",
      // Legacy column (kept for backward compatibility with old admin queries)
      payment_id: razorpay_payment_id,
      // New detailed payment columns
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      utr_number: utrNumber,
      payment_method: paymentMethod,
    });

    if (insertError) {
      console.error("[Supabase] Registration insert failed:", insertError);
      // Surface a clean user-facing message; raw DB errors may contain schema info
      return NextResponse.json(
        { error: "Failed to save your registration. Please contact support with payment ID: " + razorpay_payment_id },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      utrNumber,
      paymentMethod,
    });
  } catch (error: unknown) {
    console.error("[Verify] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred during payment verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
