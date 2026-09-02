import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  sendRegistrationConfirmationEmail,
  sendRejectionEmail,
  EmailAttendee,
} from "@/lib/email-service";

export const dynamic = "force-dynamic";

async function checkAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, action, rejectionReason } = body;

    if (!id || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: "Invalid parameters. 'id' and valid 'action' ('approve' | 'reject') are required." },
        { status: 400 }
      );
    }

    // Fetch the target registration record
    const { data: reg, error: fetchError } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !reg) {
      return NextResponse.json(
        { error: "Registration record not found." },
        { status: 404 }
      );
    }

    const buyerEmail = reg.buyer_email || reg.email;
    const buyerName = reg.full_name;
    const utrNumber = reg.utr_number || "N/A";
    const tierName = reg.tier_name || "Delegate Pass";
    const amountPaid = Number(reg.amount_paid) || 0;

    if (action === "approve") {
      // 1. Update database record status
      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          approval_status: "approved",
          ticket_status: "confirmed",
        })
        .eq("id", id);

      if (updateError) {
        console.error("[Approve] Update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update registration status in database." },
          { status: 500 }
        );
      }

      // 2. Prepare attendee list for official pass generation & confirmation email
      const rawAttendees =
        reg.attendees_json && Array.isArray(reg.attendees_json) && reg.attendees_json.length > 0
          ? reg.attendees_json
          : [
              {
                fullName: reg.full_name,
                email: reg.email,
                phone: reg.phone,
                organization: reg.organization || "GCEM",
                designation: reg.designation || "Student",
              },
            ];

      const emailAttendees: EmailAttendee[] = rawAttendees.map((att: any, idx: number) => ({
        id: idx === 0 ? reg.id : `${reg.id}-${idx + 1}`,
        fullName: att.fullName || reg.full_name,
        email: att.email || buyerEmail,
        phone: att.phone || reg.phone,
        organization: att.organization || reg.organization || "GCEM",
        designation: att.designation || reg.designation || "Student",
      }));

      // 3. Dispatch official pass confirmation email
      try {
        await sendRegistrationConfirmationEmail({
          buyerEmail,
          buyerName,
          attendees: emailAttendees,
          tierName,
          amountPaid,
          paymentId: reg.payment_id || `UPI-${utrNumber}`,
        });
      } catch (emailErr) {
        console.warn("[Approve] Confirmation email dispatch warning:", emailErr);
      }

      return NextResponse.json({
        success: true,
        action: "approve",
        id,
        message: "Registration successfully approved and pass dispatched.",
      });
    } else {
      // action === "reject"
      // 1. Update database record status
      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          approval_status: "rejected",
          ticket_status: "rejected",
        })
        .eq("id", id);

      if (updateError) {
        console.error("[Reject] Update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update registration status in database." },
          { status: 500 }
        );
      }

      // 2. Dispatch polite rejection notification email
      try {
        await sendRejectionEmail({
          buyerEmail,
          buyerName,
          utrNumber,
          tierName,
          amountPaid,
          rejectionReason: rejectionReason || "Unable to verify transaction in official bank statement.",
        });
      } catch (emailErr) {
        console.warn("[Reject] Rejection email dispatch warning:", emailErr);
      }

      return NextResponse.json({
        success: true,
        action: "reject",
        id,
        message: "Registration rejected and notice dispatched.",
      });
    }
  } catch (error: unknown) {
    console.error("[Admin Approve API] Fatal error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
