// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface EmailAttendee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  designation?: string | null;
}

export interface SendConfirmationParams {
  buyerEmail: string;
  buyerName: string;
  attendees: EmailAttendee[];
  tierName: string;
  amountPaid: number;
  razorpayPaymentId?: string | null;
  razorpayOrderId?: string | null;
  eventDate?: string;
  eventVenue?: string;
}

/**
 * Generate a responsive, modern TEDxGCEM HTML email template
 */
function generateTicketEmailHtml(params: {
  recipientName: string;
  isBuyerSummary?: boolean;
  ticketId: string;
  tierName: string;
  amountPaid: number;
  attendeeList: EmailAttendee[];
  eventDate: string;
  eventVenue: string;
  razorpayPaymentId?: string | null;
}) {
  const {
    recipientName,
    isBuyerSummary,
    ticketId,
    tierName,
    amountPaid,
    attendeeList,
    eventDate,
    eventVenue,
    razorpayPaymentId,
  } = params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tedxgcem.in";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your TEDxGCEM 2026 Ticket Pass</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #121215; border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          <!-- Top Red Header Bar -->
          <tr>
            <td style="background-color: #EB0028; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: -1px; text-transform: uppercase; color: #ffffff;">
                TED<span style="font-size: 24px; text-transform: lowercase;">x</span>GCEM <span style="color: #000000; font-family: monospace; font-size: 24px;">2026</span>
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.85);">
                x = independently organized TED event
              </p>
            </td>
          </tr>

          <!-- Main Email Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <!-- Greeting & Verification Pill -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; padding: 6px 18px; border-radius: 50px; background-color: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.35); color: #4ade80; font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">
                      ✓ OFFICIAL REGISTRATION CONFIRMED
                    </span>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; text-transform: uppercase; color: #ffffff; text-align: center;">
                Hello, ${recipientName}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.65); text-align: center;">
                ${
                  isBuyerSummary
                    ? `Thank you for registering. Your booking for <strong>${attendeeList.length} Delegate Pass${attendeeList.length > 1 ? "es" : ""}</strong> at <strong>TEDxGCEM 2026</strong> is officially verified and confirmed.`
                    : `Your individual delegate seat for <strong>TEDxGCEM 2026</strong> has been reserved and confirmed. We are thrilled to welcome you to a day of transformative ideas.`
                }
              </p>

              <!-- Ticket Pass Highlight Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; border: 2px dashed #EB0028; border-radius: 18px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 22px; text-align: center;">
                    <div style="font-size: 10px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 4px;">
                      PRIMARY PASS ID / ENTRY CODE
                    </div>
                    <div style="font-size: 24px; font-family: monospace; font-weight: 900; letter-spacing: 2px; color: #EB0028; text-transform: uppercase;">
                      ${ticketId}
                    </div>
                    <div style="font-size: 11px; font-family: monospace; color: #4ade80; margin-top: 6px; font-weight: bold; text-transform: uppercase;">
                      ● STATUS: CONFIRMED &amp; PAID
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Booking & Event Details Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase;">Ticket Tier:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #ffffff; text-align: right;">${tierName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase;">Total Seats:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #ffffff; text-align: right;">${attendeeList.length} Delegate${attendeeList.length > 1 ? "s" : ""}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase;">Total Amount Paid:</td>
                        <td style="padding: 6px 0; font-size: 15px; font-weight: 900; color: #EB0028; text-align: right;">₹${amountPaid}.00</td>
                      </tr>
                      ${
                        razorpayPaymentId
                          ? `
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase;">Payment Ref:</td>
                        <td style="padding: 6px 0; font-size: 11px; font-family: monospace; color: rgba(255,255,255,0.8); text-align: right;">${razorpayPaymentId}</td>
                      </tr>
                      `
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase;">Event Date:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #ffffff; text-align: right;">${eventDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.4); text-transform: uppercase;">Venue:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: bold; color: #ffffff; text-align: right;">${eventVenue}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Participant Breakdown (For Group Bookings) -->
              ${
                attendeeList.length > 1
                  ? `
              <div style="margin-bottom: 28px;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-family: monospace; text-transform: uppercase; letter-spacing: 1.5px; color: #EB0028;">
                  Registered Attendees (${attendeeList.length}):
                </h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                  ${attendeeList
                    .map(
                      (att, idx) => `
                    <tr style="background-color: ${idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)"};">
                      <td style="padding: 10px 14px; font-size: 12px; font-weight: bold; color: #ffffff;">
                        ${idx + 1}. ${att.fullName}
                        <div style="font-size: 10px; font-family: monospace; font-weight: normal; color: rgba(255,255,255,0.45); margin-top: 2px;">
                          ${att.organization} &bull; ${att.designation || "Student"}
                        </div>
                      </td>
                      <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-size: 11px; color: #EB0028; font-weight: bold;">
                        TEDX-${att.id.slice(0, 8).toUpperCase()}
                      </td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>
              </div>
              `
                  : ""
              }

              <!-- CTA Button: Download Pass -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}" target="_blank" style="display: inline-block; background-color: #EB0028; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 25px rgba(235,0,40,0.45);">
                      Download Official Delegate Pass →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Important Check-in Instructions -->
              <div style="padding: 18px; background-color: rgba(235,0,40,0.06); border: 1px solid rgba(235,0,40,0.25); border-radius: 14px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; color: #EB0028;">
                  📌 Important Check-In Guidelines:
                </h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.7);">
                  <li>Please log in with your Google account on the website to download your official high-resolution badge.</li>
                  <li>Present the digital pass badge or printed copy at the GCEM registration desk for QR code scanning.</li>
                  <li>Please carry a valid student / institutional ID card for verification.</li>
                </ul>
              </div>

              <!-- Support Note -->
              <p style="margin: 0; font-size: 11px; text-align: center; color: rgba(255,255,255,0.4); line-height: 1.5;">
                Need help or have questions? Reply directly to this email or reach us at <a href="mailto:tedxgcem@gmail.com" style="color: #EB0028; text-decoration: none;">tedxgcem@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #000000; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0; font-size: 10px; font-family: monospace; color: rgba(255,255,255,0.3); text-transform: uppercase;">
                © 2026 TEDxGCEM. This independent TEDx event is operated under license from TED.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send Automated Confirmation Email using Resend (custom domain) or Nodemailer (SMTP)
 */
export async function sendRegistrationConfirmationEmail(params: SendConfirmationParams) {
  const {
    buyerEmail,
    buyerName,
    attendees,
    tierName,
    amountPaid,
    razorpayPaymentId,
    eventDate = "October 15, 2026",
    eventVenue = "GCEM Auditorium, Bengaluru",
  } = params;

  if (!buyerEmail || attendees.length === 0) {
    console.warn("[Email Service] Missing buyerEmail or attendees. Skipping email transmission.");
    return { success: false, reason: "Missing recipient details" };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "team@tedxgcem.in";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const primaryTicketId = attendees[0]?.id
    ? `TEDX-${attendees[0].id.slice(0, 8).toUpperCase()}`
    : "TEDX-PASS";

  const emailSubject = `Confirmation & Ticket Pass: TEDxGCEM 2026 [${primaryTicketId}]`;

  // 1. Generate Buyer Email HTML
  const buyerHtml = generateTicketEmailHtml({
    recipientName: buyerName || "Valued Attendee",
    isBuyerSummary: attendees.length > 1,
    ticketId: primaryTicketId,
    tierName,
    amountPaid,
    attendeeList: attendees,
    eventDate,
    eventVenue,
    razorpayPaymentId,
  });

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // A. ATTEMPT TRANSMISSION VIA RESEND (Custom Domain: tedxgcem.in)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      // Send master confirmation to the buyer
      const sendResult = await resend.emails.send({
        from: `TEDxGCEM <${fromEmail}>`,
        to: buyerEmail,
        replyTo: "tedxgcem@gmail.com",
        subject: emailSubject,
        html: buyerHtml,
      });

      if (sendResult.error) {
        console.error(`[Email Service] Resend error sending to ${buyerEmail}:`, sendResult.error);
      } else {
        console.log(`[Email Service] Confirmation email sent via Resend to buyer: ${buyerEmail}, ID:`, sendResult.data?.id);
      }

      // If multi-ticket order, also send individual ticket emails to other delegates if their emails are distinct
      if (attendees.length > 1) {
        const perTicketPrice = Math.round((amountPaid / attendees.length) * 100) / 100;

        for (let idx = 0; idx < attendees.length; idx++) {
          const att = attendees[idx];
          if (att.email && att.email.toLowerCase() !== buyerEmail.toLowerCase()) {
            try {
              let delegateTicketId = att.id || "TEDX-PASS";
              if (!delegateTicketId.startsWith("TEDX-")) {
                const base = delegateTicketId.replace(/^tedx-/i, "").slice(0, 8).toUpperCase();
                const lastPart = delegateTicketId.includes("-") ? delegateTicketId.split("-").pop() : String(idx + 1);
                delegateTicketId = (lastPart && /^\d+$/.test(lastPart))
                  ? `TEDX-${base}-${lastPart}`
                  : `TEDX-${base}-${idx + 1}`;
              }

              const delegateHtml = generateTicketEmailHtml({
                recipientName: att.fullName,
                isBuyerSummary: false,
                ticketId: delegateTicketId,
                tierName,
                amountPaid: perTicketPrice,
                attendeeList: [att],
                eventDate,
                eventVenue,
                razorpayPaymentId,
              });

              await resend.emails.send({
                from: `TEDxGCEM <${fromEmail}>`,
                to: att.email,
                replyTo: "tedxgcem@gmail.com",
                subject: `Your Delegate Pass: TEDxGCEM 2026 [${delegateTicketId}]`,
                html: delegateHtml,
              });

              console.log(`[Email Service] Delegate pass email sent via Resend to: ${att.email} (${delegateTicketId})`);
            } catch (delErr) {
              console.warn(`[Email Service] Failed to send email to delegate ${att.email}:`, delErr);
            }
          }
        }
      }

      return { success: true, provider: "resend" };
    } catch (resendError) {
      console.error("[Email Service] Resend dispatch failed:", resendError);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // B. ATTEMPT TRANSMISSION VIA NODEMAILER SMTP (Fallback / Gmail)
  // ─────────────────────────────────────────────────────────────────────────────
  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "465"),
        secure: (process.env.SMTP_SECURE || "true") === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });

      await transporter.sendMail({
        from: `"TEDxGCEM" <${smtpUser}>`,
        to: buyerEmail,
        replyTo: "tedxgcem@gmail.com",
        subject: emailSubject,
        html: buyerHtml,
      });

      console.log(`[Email Service] Confirmation email sent via SMTP to buyer: ${buyerEmail}`);

      if (attendees.length > 1) {
        const perTicketPrice = Math.round((amountPaid / attendees.length) * 100) / 100;

        for (let idx = 0; idx < attendees.length; idx++) {
          const att = attendees[idx];
          if (att.email && att.email.toLowerCase() !== buyerEmail.toLowerCase()) {
            try {
              let delegateTicketId = att.id || "TEDX-PASS";
              if (!delegateTicketId.startsWith("TEDX-")) {
                const base = delegateTicketId.replace(/^tedx-/i, "").slice(0, 8).toUpperCase();
                const lastPart = delegateTicketId.includes("-") ? delegateTicketId.split("-").pop() : String(idx + 1);
                delegateTicketId = (lastPart && /^\d+$/.test(lastPart))
                  ? `TEDX-${base}-${lastPart}`
                  : `TEDX-${base}-${idx + 1}`;
              }

              const delegateHtml = generateTicketEmailHtml({
                recipientName: att.fullName,
                isBuyerSummary: false,
                ticketId: delegateTicketId,
                tierName,
                amountPaid: perTicketPrice,
                attendeeList: [att],
                eventDate,
                eventVenue,
                razorpayPaymentId,
              });

              await transporter.sendMail({
                from: `"TEDxGCEM" <${smtpUser}>`,
                to: att.email,
                replyTo: "tedxgcem@gmail.com",
                subject: `Your Delegate Pass: TEDxGCEM 2026 [${delegateTicketId}]`,
                html: delegateHtml,
              });

              console.log(`[Email Service] Delegate pass email sent via SMTP to: ${att.email} (${delegateTicketId})`);
            } catch (delErr) {
              console.warn(`[Email Service] SMTP dispatch to delegate ${att.email} failed:`, delErr);
            }
          }
        }
      }

      return { success: true, provider: "smtp" };
    } catch (smtpError) {
      console.error("[Email Service] SMTP dispatch failed:", smtpError);
    }
  }

  console.warn("[Email Service] No active email credentials (RESEND_API_KEY or SMTP_USER/PASS) found in environment.");
  return { success: false, reason: "No email provider credentials configured" };
}
