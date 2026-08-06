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
    
    // Extract short ID part (e.g. TEDX-27197CEA -> 27197cea)
    const rawId = id ? id.replace("TEDX-", "").toLowerCase() : "";

    let query = supabase.from("registrations").select("full_name, organization, designation, ticket_status, payment_id, created_at");
    
    if (email) {
      query = query.eq("email", email);
    }

    const { data: rows } = await query;
    const matched = rows?.find((r: { id?: string; full_name?: string }) => 
      !rawId || (r.id && r.id.toLowerCase().startsWith(rawId))
    ) || rows?.[0];

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
