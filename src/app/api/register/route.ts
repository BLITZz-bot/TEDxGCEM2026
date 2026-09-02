import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// This endpoint is DEPRECATED.
// All registrations now go through the secure Direct UPI & Handoff flow:
//   POST /api/register/create-draft  → creates registration draft
//   POST /api/register/upi-submit    → submits UTR & screenshot verification
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
