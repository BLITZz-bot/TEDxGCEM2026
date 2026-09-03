import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { redeemCoupon } from "@/lib/coupon-service";
import { sendVerificationPendingEmail } from "@/lib/email-service";
import { getActiveTicketTier } from "@/lib/ticket-service";
import { getDraft, updateDraftStatus } from "@/lib/draft-store";

export const dynamic = "force-dynamic";

interface AttendeeRecord {
  fullName: string;
  email?: string;
  phone: string;
  organization?: string;
  designation?: string;
  linkedin?: string;
  referral?: string;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`upi_${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many payment submission attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    let draftId = "";
    let utrNumber = "";
    let turnstileToken = "";
    let screenshotBuffer: Buffer | null = null;
    let screenshotMime = "image/jpeg";
    let screenshotExt = "jpg";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      draftId = (body.draftId as string)?.trim() || "";
      utrNumber = (body.utrNumber as string)?.trim() || "";
      turnstileToken = (body.turnstileToken as string)?.trim() || "";
      const base64Data = (body.screenshotBase64 as string) || "";
      if (base64Data) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches) {
          screenshotMime = matches[1];
          screenshotBuffer = Buffer.from(matches[2], "base64");
        } else {
          screenshotBuffer = Buffer.from(base64Data, "base64");
        }
        screenshotExt = screenshotMime.includes("png") ? "png" : screenshotMime.includes("webp") ? "webp" : "jpg";
      }
    } else {
      const formData = await request.formData();
      draftId = (formData.get("draftId") as string)?.trim() || "";
      utrNumber = (formData.get("utrNumber") as string)?.trim() || "";
      turnstileToken = (formData.get("turnstileToken") as string)?.trim() || "";
      const file = formData.get("screenshot") as File | null;
      if (file) {
        screenshotMime = file.type;
        screenshotExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        screenshotBuffer = Buffer.from(await file.arrayBuffer());
      }
    }

    // draftId is required — prevents client-controlled attendee/amount manipulation
    if (!draftId) {
      return NextResponse.json(
        { error: "Missing registration session. Please restart the payment flow." },
        { status: 400 }
      );
    }

    // NPCI UTR / UPI reference numbers range from 8-22 alphanumeric chars across all banks.
    // Strictly \d{12} was rejecting valid Axis/ICICI/Google Pay alphanumeric references.
    const normalizedUtr = utrNumber.toUpperCase();
    if (!normalizedUtr || !/^[A-Z0-9]{8,22}$/.test(normalizedUtr)) {
      return NextResponse.json(
        { error: "Invalid UTR number. Must be 8–22 alphanumeric characters (letters and digits only)." },
        { status: 400 }
      );
    }
    // Use normalized uppercase UTR going forward
    utrNumber = normalizedUtr;


    if (!screenshotBuffer || screenshotBuffer.length === 0) {
      return NextResponse.json(
        { error: "Payment screenshot is required as proof." },
        { status: 400 }
      );
    }

    // Validate screenshot size & MIME type (must match Supabase bucket file_size_limit = 2MB)
    if (screenshotBuffer.length > 2.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Screenshot file exceeds size limit. Please choose a smaller image." },
        { status: 400 }
      );
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(screenshotMime)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG, JPG, and WebP images are accepted." },
        { status: 400 }
      );
    }

    // Cloudflare Turnstile Verification
    const isDev = process.env.NODE_ENV !== "production";
    const turnstileSecret = isDev
      ? "1x0000000000000000000000000000000AA"
      : process.env.TURNSTILE_SECRET_KEY;

    const isPlaceholderSecret =
      !turnstileSecret ||
      turnstileSecret.trim() === "" ||
      turnstileSecret.includes("...") ||
      turnstileSecret.toLowerCase().includes("placeholder");

    if (isDev) {
      console.log("[Turnstile] Accepted verification token in development mode.");
    } else if (turnstileSecret && !isPlaceholderSecret) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Security check is required. Please verify the captcha." },
          { status: 400 }
        );
      }

      try {
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: turnstileSecret,
            response: turnstileToken,
            remoteip: ip || undefined,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          console.error("[Turnstile] Verification failed:", verifyData["error-codes"] || verifyData);
          return NextResponse.json(
            { error: "Security check failed. Please refresh the captcha and try again." },
            { status: 400 }
          );
        }
      } catch (err) {
        console.warn("[Turnstile] Verification call warning:", err);
      }
    }

    const supabase = await createClient();

    // Idempotency check: Has this UTR already been submitted?
    const { data: existingUtr } = await supabase
      .from("registrations")
      .select("id, full_name, tier_name, utr_number")
      .eq("utr_number", utrNumber)
      .maybeSingle();

    if (existingUtr) {
      return NextResponse.json(
        {
          error: `This 12-digit UTR (${utrNumber}) has already been registered in our system. If you believe this is an error, please contact support.`,
        },
        { status: 409 }
      );
    }

    // Fetch the draft — required, source of truth for price and attendees
    const draft = await getDraft(draftId);

    if (!draft) {
      return NextResponse.json(
        { error: "Registration session not found or expired. Please restart the payment flow." },
        { status: 404 }
      );
    }

    if (draft.status === "confirmed") {
      return NextResponse.json({
        success: true,
        message: "Registration already confirmed.",
        draftId: draft.id,
        alreadyConfirmed: true,
      });
    }

    // Current user context (fallback to draft user if available)
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    const buyerEmail =
      draft.buyer_email ||
      sessionUser?.email ||
      draft.email ||
      "attendee@tedxgcem.in";

    const validUuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let userId: string | null = sessionUser?.id || draft.user_id || null;
    if (userId && !validUuidRegex.test(userId)) {
      userId = null;
    }

    // Upload screenshot to Supabase Storage
    const storagePath = `${draftId}_${Date.now()}_${utrNumber}.${screenshotExt}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(storagePath, screenshotBuffer!, {
        contentType: screenshotMime,
        upsert: true,
      });

    let screenshotUrl = "";
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(storagePath);
      screenshotUrl = publicUrlData.publicUrl;
    } else {
      console.warn("[Storage] Warning on payment-proofs upload:", uploadError.message);
      screenshotUrl = `storage://payment-proofs/${storagePath}`;
    }

    // Prepare attendee records — always sourced from server-side draft, never from client
    const rawAttendeeList: AttendeeRecord[] =
      draft.attendees_json && Array.isArray(draft.attendees_json) && draft.attendees_json.length > 0
        ? draft.attendees_json
        : [
            {
              fullName: draft.full_name || "TEDx Delegate",
              email: draft.email || buyerEmail,
              phone: draft.phone || "0000000000",
              organization: draft.organization || "GCEM",
              designation: draft.designation || "Student",
              linkedin: draft.linkedin || "",
              referral: draft.referral || "",
            },
          ];

    const attendeeList = rawAttendeeList.map((att) => ({
      ...att,
      fullName: (att.fullName || "").trim(),
      email: (att.email || "").trim().toLowerCase(),
      phone: (att.phone || "").trim(),
      organization: (att.organization || "").trim() || "GCEM",
      designation: (att.designation || "").trim() || "Student",
    }));

    // All pricing from draft — never from client
    const activeTierFallback = await getActiveTicketTier();
    const tierId = draft.tier_id || activeTierFallback.id;
    const tierName = draft.tier_name || activeTierFallback.name;
    const totalAmount = draft.amount !== undefined ? Number(draft.amount) : activeTierFallback.price * attendeeList.length;
    const couponCode = draft.coupon_code || null;
    const discountAmount = draft.discount_amount !== undefined ? Number(draft.discount_amount) : 0;
    const primaryAttendee = attendeeList[0];
    const unitPrice = activeTierFallback.price;

    const registrationRecord: Record<string, unknown> = {
      full_name: primaryAttendee.fullName.trim(),
      email: primaryAttendee.email?.trim() || buyerEmail,
      buyer_email: buyerEmail,
      phone: primaryAttendee.phone.trim(),
      organization: primaryAttendee.organization?.trim() || "GCEM",
      designation: primaryAttendee.designation?.trim() || "Student",
      linkedin: primaryAttendee.linkedin?.trim() || null,
      referral: primaryAttendee.referral?.trim() || null,
      user_id: userId,
      ticket_status: "pending_verification",
      approval_status: "pending_approval",
      payment_id: `UPI-${utrNumber}`,
      utr_number: utrNumber,
      payment_method: "direct_upi",
      payment_screenshot_url: screenshotUrl,
      tier_id: tierId,
      tier_name: tierName,
      coupon_code: couponCode,
      discount_amount: discountAmount,
      amount_paid: totalAmount,
      unit_price: unitPrice,
      ticket_count: attendeeList.length,
      attendees_json: attendeeList,
    };

    let { data: insertedData, error: insertError } = await supabase
      .from("registrations")
      .insert([registrationRecord])
      .select("id");

    // Comprehensive resilient fallback for foreign keys, missing columns, or schema mismatches
    if (insertError) {
      console.warn("[Supabase] Initial registration insert failed, trying resilient fallback:", insertError.message);
      const fallbackRecord = { ...registrationRecord };

      // If user_id foreign key failed or user deleted from auth, set to null
      if (
        insertError.message?.toLowerCase().includes("user_id") ||
        insertError.message?.toLowerCase().includes("foreign key")
      ) {
        fallbackRecord.user_id = null;
      }

      // If optional newer columns caused the failure, strip them
      if (insertError.message?.includes("attendees_json")) {
        delete fallbackRecord.attendees_json;
      }
      if (insertError.message?.includes("unit_price")) {
        delete fallbackRecord.unit_price;
      }
      if (insertError.message?.includes("approval_status")) {
        delete fallbackRecord.approval_status;
      }
      if (insertError.message?.includes("buyer_email")) {
        delete fallbackRecord.buyer_email;
      }
      if (insertError.message?.includes("payment_screenshot_url")) {
        delete fallbackRecord.payment_screenshot_url;
      }

      const retry = await supabase
        .from("registrations")
        .insert([fallbackRecord])
        .select("id");

      if (retry.data && retry.data.length > 0) {
        insertedData = retry.data;
        insertError = null;
      } else {
        insertError = retry.error || insertError;
      }
    }

    if (insertError || !insertedData || insertedData.length === 0) {
      console.error("[Supabase] UPI Registration insert error:", insertError);
      if (
        insertError?.code === "23505" ||
        insertError?.message?.toLowerCase().includes("unique") ||
        insertError?.message?.toLowerCase().includes("duplicate key")
      ) {
        if (insertError?.message?.toLowerCase().includes("email")) {
          return NextResponse.json(
            {
              error: `This email (${buyerEmail}) has already been registered. Please check "Get My Pass" to view your pass or contact support.`,
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            error: `This 12-digit UTR (${utrNumber}) has already been registered in our system. If you believe this is an error, please contact support.`,
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          error: `Failed to store registration pass: ${insertError?.message || "Database insert error"}. (UTR: ${utrNumber})`,
          details: insertError?.message,
        },
        { status: 500 }
      );
    }

    // Mark draft as submitted/pending_verification
    await updateDraftStatus(draftId, "confirmed");

    // Redeem coupon if applicable
    if (couponCode && attendeeList.length === 1) {
      try {
        await redeemCoupon(couponCode, {
          email: buyerEmail,
          fullName: attendeeList[0].fullName,
          phone: attendeeList[0].phone,
          organization: attendeeList[0].organization || "GCEM",
          registrationId: insertedData[0]?.id,
          tierId,
          amountPaid: totalAmount,
        });
      } catch (cpnErr) {
        console.warn("Coupon redemption recording error:", cpnErr);
      }
    }

    // Trigger automated verification pending email (Pass will be issued only upon admin approval)
    try {
      await sendVerificationPendingEmail({
        buyerEmail,
        buyerName: attendeeList[0]?.fullName || buyerEmail.split("@")[0],
        utrNumber,
        tierName,
        amountPaid: totalAmount,
      });
    } catch (emailErr) {
      console.warn("Verification pending email trigger error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      pendingApproval: true,
      confirmedCount: attendeeList.length,
      primaryRegistrationId: insertedData[0]?.id,
      utrNumber,
      tierName,
    });
  } catch (error: unknown) {
    console.error("[upi-submit] Fatal error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
