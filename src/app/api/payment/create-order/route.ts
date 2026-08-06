import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// TICKET PRICE — HARDCODED SERVER-SIDE ONLY.
// Never accept price from client requests — that would allow manipulation.
// ─────────────────────────────────────────────────────────────────────────────
const TICKET_PRICE_INR = 499; // ₹499
const TICKET_PRICE_PAISE = TICKET_PRICE_INR * 100; // 49900 paise

export const dynamic = "force-dynamic";

export async function POST() {
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

    // 2. Check registrations are open
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

    // 4. Validate Razorpay keys
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("xxxxxxxxxxxx")) {
      return NextResponse.json(
        { error: "Payment gateway is not configured. Please contact the organizers." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // 5. Create Razorpay order — amount is always server-controlled
    const order = await razorpay.orders.create({
      amount: TICKET_PRICE_PAISE,
      currency: "INR",
      receipt: `tedx_${Date.now()}_${user.id.slice(0, 8)}`,
      notes: {
        user_id: user.id,
        user_email: user.email,
        ticket_price_inr: String(TICKET_PRICE_INR),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    });
  } catch (error: unknown) {
    console.error("Razorpay Order Creation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment order. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
