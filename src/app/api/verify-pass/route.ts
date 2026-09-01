import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>TEDxGCEM Pass Verification</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { background: #000; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #111; border: 1px solid #333; padding: 30px; border-radius: 20px; max-width: 400px; }
              h1 { color: #EB0028; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>TEDxGCEM</h1>
              <p>Invalid verification link.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const supabase = await createClient();
    
    // Extract ID and parse optional sub-index (e.g. TEDX-27197CEA-2 -> baseId: 27197cea, subIndex: 2)
    const cleanId = id ? id.trim().replace(/^TEDX-/i, "").toLowerCase() : "";
    let baseId = cleanId;
    let subIndex: number | null = null;

    const lastDash = cleanId.lastIndexOf("-");
    if (lastDash !== -1) {
      const parsedIdx = parseInt(cleanId.slice(lastDash + 1), 10);
      if (!isNaN(parsedIdx) && parsedIdx > 0) {
        subIndex = parsedIdx;
        baseId = cleanId.slice(0, lastDash);
      }
    }

    const cleanEmail = email ? email.trim().toLowerCase() : "";

    let query = supabase
      .from("registrations")
      .select("id, full_name, email, buyer_email, organization, designation, ticket_status, payment_id, created_at, attendees_json, unit_price, amount_paid, tier_name");
    
    if (baseId) {
      query = query.ilike("id", `${baseId}%`);
    } else if (cleanEmail) {
      query = query.or(`email.ilike.${cleanEmail},buyer_email.ilike.${cleanEmail}`);
    }

    let { data: rows } = await query;

    // Fallback: If no rows found by direct email, search attendees_json for matching email
    if ((!rows || rows.length === 0) && cleanEmail) {
      try {
        const { data: jsonSearchRows } = await supabase
          .from("registrations")
          .select("id, full_name, email, buyer_email, organization, designation, ticket_status, payment_id, created_at, attendees_json, unit_price, amount_paid, tier_name")
          .filter("attendees_json", "cs", JSON.stringify([{ email: cleanEmail }]));
        if (jsonSearchRows && jsonSearchRows.length > 0) {
          rows = jsonSearchRows;
        }
      } catch {
        // non-blocking
      }
    }

    const primaryRow = rows?.[0];

    interface AttendeeRecord {
      fullName?: string;
      email?: string;
      phone?: string;
      organization?: string;
      designation?: string;
    }

    interface VerifiedRegistration {
      id?: string;
      full_name?: string;
      email?: string;
      buyer_email?: string | null;
      organization?: string;
      designation?: string | null;
      ticket_status?: string;
      payment_id?: string | null;
      created_at?: string;
      pass_code?: string;
      amount_paid?: number | string | null;
      unit_price?: number | string | null;
      [key: string]: unknown;
    }

    let matched: VerifiedRegistration | null = (primaryRow as VerifiedRegistration) || null;

    if (primaryRow && Array.isArray(primaryRow.attendees_json) && primaryRow.attendees_json.length > 1) {
      let attendeeItem: AttendeeRecord | null = null;
      let resolvedIndex = subIndex || 1;

      // Match by email if available
      if (cleanEmail) {
        const emailIdx = primaryRow.attendees_json.findIndex(
          (a: AttendeeRecord) => a.email && a.email.toLowerCase().trim() === cleanEmail
        );
        if (emailIdx !== -1) {
          attendeeItem = primaryRow.attendees_json[emailIdx];
          resolvedIndex = emailIdx + 1;
        }
      }

      // Match by subIndex if not matched by email
      if (!attendeeItem && subIndex && subIndex >= 1 && subIndex <= primaryRow.attendees_json.length) {
        attendeeItem = primaryRow.attendees_json[subIndex - 1];
        resolvedIndex = subIndex;
      }

      // Fallback to first attendee
      if (!attendeeItem && primaryRow.attendees_json.length > 0) {
        attendeeItem = primaryRow.attendees_json[0];
        resolvedIndex = 1;
      }

      if (attendeeItem) {
        const unitPrice =
          Number(primaryRow.unit_price) ||
          (primaryRow.amount_paid ? Math.round(Number(primaryRow.amount_paid) / primaryRow.attendees_json.length) : 300);

        matched = {
          ...primaryRow,
          full_name: attendeeItem.fullName?.trim() || primaryRow.full_name,
          email: attendeeItem.email?.trim() || primaryRow.email,
          organization: attendeeItem.organization?.trim() || primaryRow.organization || "GCEM",
          designation: attendeeItem.designation?.trim() || primaryRow.designation || "Student",
          pass_code: `TEDX-${primaryRow.id.slice(0, 8).toUpperCase()}-${resolvedIndex}`,
          amount_paid: unitPrice,
        };
      }
    }

    const isValid = matched && (matched.ticket_status === "confirmed" || matched.ticket_status === "approved" || matched.payment_id);

    const htmlContent = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pass Verification | TEDxGCEM</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #09090b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
          .badge-card { background: #121215; border: 2px solid ${isValid ? '#22c55e' : '#ef4444'}; border-radius: 28px; padding: 32px 24px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.8); }
          .logo { font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 4px; }
          .logo span { color: #EB0028; }
          .subtitle { font-size: 10px; font-family: monospace; letter-spacing: 2px; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 24px; }
          .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 50px; background: ${isValid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}; border: 1px solid ${isValid ? '#22c55e' : '#ef4444'}; color: ${isValid ? '#4ade80' : '#f87171'}; font-size: 11px; font-family: monospace; font-weight: 700; text-transform: uppercase; margin-bottom: 24px; }
          .status-dot { width: 8px; height: 8px; border-radius: 50%; background: ${isValid ? '#22c55e' : '#ef4444'}; }
          .info-group { margin-bottom: 16px; }
          .label { font-size: 9px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
          .val-name { font-size: 24px; font-weight: 900; text-transform: uppercase; color: #fff; }
          .val-sub { font-size: 12px; font-family: monospace; color: #EB0028; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
          .val-org { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.85); text-transform: uppercase; }
          .footer-box { margin-top: 24px; padding-top: 16px; border-top: 1px stroke rgba(255,255,255,0.1); font-size: 10px; font-family: monospace; color: rgba(255,255,255,0.3); text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="badge-card">
          <div class="logo"><span>TEDx</span>GCEM</div>
          <div class="subtitle">Official Ticket Verification</div>

          <div class="status-pill">
            <span class="status-dot"></span>
            ${isValid ? 'AUTHENTIC TICKET VERIFIED' : 'INVALID / UNPAID TICKET'}
          </div>

          ${matched ? `
            <div class="info-group">
              <div class="label">ATTENDEE DELEGATE</div>
              <div class="val-name">${matched.full_name}</div>
              ${matched.designation ? `<div class="val-sub">● ${matched.designation}</div>` : ''}
            </div>

            <div class="info-group" style="margin-top: 20px;">
              <div class="label">INSTITUTION</div>
              <div class="val-org">${matched.organization}</div>
            </div>

            <div class="info-group" style="margin-top: 20px;">
              <div class="label">PASS CODE</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #EB0028; letter-spacing: 1px;">
                ${matched.pass_code || (matched.id ? 'TEDX-' + matched.id.slice(0, 8).toUpperCase() : 'TEDX-PASS')}
              </div>
            </div>

            <div class="info-group" style="margin-top: 16px;">
              <div class="label">PAYMENT RECEIPT</div>
              <div style="font-family: monospace; font-size: 12px; color: #4ade80;">${matched.payment_id || 'VERIFIED ONLINE'}</div>
            </div>
          ` : `
            <p style="font-size: 13px; color: rgba(255,255,255,0.5);">No registration found for this ID.</p>
          `}

          <div class="footer-box">
            VENUE: GCEM AUDITORIUM, BENGALURU
          </div>
        </div>
      </body>
    </html>`;

    return new NextResponse(htmlContent, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Pass verification error:", err);
    return new NextResponse("Error verifying ticket pass.", { status: 500 });
  }
}
