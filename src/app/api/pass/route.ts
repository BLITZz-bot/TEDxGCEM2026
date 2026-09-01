import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verify user authentication server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Check if tickets/passes are open for download
    const { getSettings } = await import("@/lib/settings-service");
    const settings = await getSettings();
    if (settings.reveal_tickets === false) {
      return NextResponse.json({ error: "Ticket downloads are currently closed." }, { status: 403 });
    }

    // Query registration details based on server session email
    // 1. Direct matches: where user email matches primary attendee or buyer_email
    const userEmail = user.email.toLowerCase().trim();
    const { data: directData, error: directError } = await supabase
      .from("registrations")
      .select("*")
      .or(`email.ilike.${userEmail},buyer_email.ilike.${userEmail}`)
      .order("created_at", { ascending: true });

    if (directError) {
      throw directError;
    }

    // 2. Query JSON matches: in case user is a secondary attendee stored in attendees_json
    let jsonMatches: typeof directData = [];
    try {
      const { data: jsonSearchData } = await supabase
        .from("registrations")
        .select("*")
        .filter("attendees_json", "cs", JSON.stringify([{ email: userEmail }]))
        .order("created_at", { ascending: true });

      if (jsonSearchData && Array.isArray(jsonSearchData) && jsonSearchData.length > 0) {
        jsonMatches = jsonSearchData;
      }
    } catch {
      // Non-blocking fallback if json filter is unavailable
    }

    // Resilient fallback: If no direct match and no JSON containment match found,
    // fetch group registrations with attendees_json and inspect in memory
    if ((!directData || directData.length === 0) && jsonMatches.length === 0) {
      try {
        const { data: groupRows } = await supabase
          .from("registrations")
          .select("*")
          .not("attendees_json", "is", null)
          .order("created_at", { ascending: false })
          .limit(100);

        if (groupRows && Array.isArray(groupRows)) {
          const matchedGroup = groupRows.filter(
            (r) =>
              Array.isArray(r.attendees_json) &&
              r.attendees_json.some(
                (att: { email?: string }) =>
                  att.email && att.email.toLowerCase().trim() === userEmail
              )
          );
          if (matchedGroup.length > 0) {
            jsonMatches = matchedGroup;
          }
        }
      } catch {
        // non-blocking
      }
    }

    interface RawAttendee {
      fullName?: string;
      email?: string;
      phone?: string;
      organization?: string;
      designation?: string;
      linkedin?: string;
      referral?: string;
    }

    interface RegistrationRow {
      id: string;
      full_name: string;
      email: string;
      buyer_email?: string | null;
      phone?: string;
      organization?: string;
      designation?: string | null;
      ticket_status: string;
      ticket_count?: number;
      payment_id?: string | null;
      razorpay_payment_id?: string | null;
      utr_number?: string | null;
      payment_method?: string | null;
      amount_paid?: number | string | null;
      unit_price?: number | string | null;
      attendees_json?: RawAttendee[] | null;
      created_at?: string;
      pass_code?: string;
      delegate_index?: number;
      total_delegates?: number;
      [key: string]: unknown;
    }

    // Deduplicate registrations by id
    const rowMap = new Map<string, RegistrationRow>();
    for (const r of (directData || []) as RegistrationRow[]) rowMap.set(r.id, r);
    for (const r of (jsonMatches || []) as RegistrationRow[]) rowMap.set(r.id, r);

    const consolidatedRows = Array.from(rowMap.values());

    // 3. Expand / Virtualize Passes
    const virtualPasses: RegistrationRow[] = [];

    for (const reg of consolidatedRows) {
      const attendeesList = Array.isArray(reg.attendees_json) ? reg.attendees_json : [];
      const hasGroupAttendees = attendeesList.length > 1;

      const isBuyer =
        (reg.buyer_email && reg.buyer_email.toLowerCase().trim() === userEmail) ||
        (!reg.buyer_email && reg.email && reg.email.toLowerCase().trim() === userEmail);

      const baseUuidPart = (reg.id || "").replace(/^tedx-/i, "").slice(0, 8).toUpperCase();
      const unitPrice =
        Number(reg.unit_price) ||
        (reg.amount_paid && hasGroupAttendees
          ? Math.round((Number(reg.amount_paid) / attendeesList.length) * 100) / 100
          : Number(reg.amount_paid) || 300);

      if (hasGroupAttendees) {
        if (isBuyer) {
          // BUYER EXPERIENCE:
          // Expand into N individual pass objects so the buyer can view & download all passes
          attendeesList.forEach((att: RawAttendee, idx: number) => {
            const delegateIndex = idx + 1;
            const passCode = `TEDX-${baseUuidPart}-${delegateIndex}`;
            virtualPasses.push({
              ...reg,
              id: `${reg.id}-${delegateIndex}`,
              pass_code: passCode,
              full_name: att.fullName?.trim() || reg.full_name,
              email: att.email?.trim() || reg.email,
              phone: att.phone?.trim() || reg.phone,
              organization: att.organization?.trim() || reg.organization || "GCEM",
              designation: att.designation?.trim() || reg.designation || "Student",
              amount_paid: unitPrice,
              unit_price: unitPrice,
              ticket_count: 1,
              delegate_index: delegateIndex,
              total_delegates: attendeesList.length,
            });
          });
        } else {
          // SECONDARY DELEGATE EXPERIENCE:
          // Locate the specific attendee matching the logged-in user's email
          const matchedIdx = attendeesList.findIndex(
            (att: RawAttendee) =>
              att.email && att.email.toLowerCase().trim() === userEmail
          );

          if (matchedIdx !== -1) {
            const att = attendeesList[matchedIdx];
            const delegateIndex = matchedIdx + 1;
            const passCode = `TEDX-${baseUuidPart}-${delegateIndex}`;
            virtualPasses.push({
              ...reg,
              id: `${reg.id}-${delegateIndex}`,
              pass_code: passCode,
              full_name: att.fullName?.trim() || reg.full_name,
              email: att.email?.trim() || userEmail,
              phone: att.phone?.trim() || reg.phone,
              organization: att.organization?.trim() || reg.organization || "GCEM",
              designation: att.designation?.trim() || reg.designation || "Student",
              amount_paid: unitPrice,
              unit_price: unitPrice,
              ticket_count: 1,
              delegate_index: delegateIndex,
              total_delegates: attendeesList.length,
            });
          }
        }
      } else {
        // Standard single-ticket registration
        const passCode = `TEDX-${baseUuidPart}`;
        virtualPasses.push({
          ...reg,
          pass_code: passCode,
          amount_paid: unitPrice,
          unit_price: unitPrice,
          ticket_count: 1,
        });
      }
    }

    return NextResponse.json({
      registration: virtualPasses[0] || null,
      registrations: virtualPasses,
    });
  } catch (error: unknown) {
    console.error("Server Pass fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pass.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
