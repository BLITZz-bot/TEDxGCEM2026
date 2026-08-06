import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// This endpoint is DEPRECATED.
// All registrations now go through the secure Razorpay payment flow:
//   POST /api/payment/create-order  → creates Razorpay order
//   POST /api/payment/verify        → verifies payment & saves registration
//
// This route is intentionally disabled to prevent bypassing payment.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Direct registration is no longer supported. Please use the Register Now form on the website to complete your registration with payment.",
    },
    { status: 410 } // 410 Gone — intentionally retired
  );
}
