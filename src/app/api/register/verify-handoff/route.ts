import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDraft } from "@/lib/draft-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get("draft_id");
    const token = searchParams.get("token");

    if (!draftId) {
      return NextResponse.json(
        { error: "Missing draft_id parameter." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the draft record
    const draft = await getDraft(draftId);

    if (!draft) {
      return NextResponse.json(
        { error: "Registration draft not found or expired." },
        { status: 404 }
      );
    }

    // Check if this draft is already finalized/confirmed
    if (draft.status === "confirmed") {
      return NextResponse.json({
        confirmed: true,
        draftId: draft.id,
        fullName: draft.full_name,
        email: draft.email,
        tierName: draft.tier_name,
        message: "This registration has already been verified and confirmed.",
      });
    }

    // Verify token validity if provided
    let isTokenValid = false;
    let isExpired = false;

    if (token && draft.auth_handoff_token === token) {
      const expiresAt = new Date(draft.auth_token_expires_at || 0).getTime();
      if (Date.now() <= expiresAt) {
        isTokenValid = true;
      } else {
        isExpired = true;
      }
    }

    // Check if the current client already has an active Supabase user session matching the draft
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const isUserMatch =
      currentUser &&
      (currentUser.id === draft.user_id ||
        currentUser.email?.toLowerCase() === draft.buyer_email?.toLowerCase());

    return NextResponse.json({
      success: true,
      draftId: draft.id,
      isValid: isTokenValid || Boolean(isUserMatch),
      isExpired,
      buyerEmail: draft.buyer_email || draft.email,
      data: {
        fullName: draft.full_name,
        email: draft.email,
        phone: draft.phone,
        organization: draft.organization,
        designation: draft.designation,
        linkedin: draft.linkedin,
        referral: draft.referral,
        tierId: draft.tier_id,
        tierName: draft.tier_name,
        quantity: draft.quantity,
        amount: draft.amount,
        couponCode: draft.coupon_code,
        discountAmount: draft.discount_amount,
        attendees: draft.attendees_json,
      },
    });
  } catch (error: unknown) {
    console.error("[verify-handoff] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
