import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in with Google." }, { status: 401 });
    }

    const { name, message } = await request.json();

    if (!name || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Insert message record into Supabase using the authenticated user's credentials
    const { error } = await supabase.from("messages").insert({
      name,
      email: user.email,
      message,
      user_id: user.id,
    });

    if (error) {
      throw error;
    }

    // Attempt to send email via Resend or Nodemailer SMTP
    const resendApiKey = process.env.RESEND_API_KEY;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";

    const mailSubject = `New Contact Message from ${name}`;
    const mailText = `You have received a new message from the TEDxGCEM contact form.\n\nSender Details:\nName: ${name}\nEmail: ${user.email}\n\nMessage:\n${message}`;
    const mailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #EB0028; border-bottom: 2px solid #EB0028; padding-bottom: 10px; text-transform: uppercase;">TEDxGCEM Inbox Message</h2>
        <p>You have received a new submission from the contact form.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 100px; color: #555;">Name:</td>
            <td style="padding: 8px 0; color: #111;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 8px 0; color: #111;"><a href="mailto:${user.email}">${user.email}</a></td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #EB0028; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #333; margin-bottom: 8px;">Message:</p>
          <p style="margin: 0; color: #444; white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <p style="font-size: 10px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          This message was sent from the authenticated contact form on the TEDxGCEM portal.
        </p>
      </div>
    `;

    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resendClient = new Resend(resendApiKey);
        
        // Note: Resend's free tier requires sending "from" a verified domain or "onboarding@resend.dev"
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        
        await resendClient.emails.send({
          from: `TEDxGCEM Inbox <${fromEmail}>`,
          to: adminEmail,
          replyTo: user.email,
          subject: mailSubject,
          text: mailText,
          html: mailHtml,
        });
      } catch (resendErr) {
        console.warn("Resend email transmission failed, but record was saved to database:", resendErr);
      }
    } else if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "465"),
          secure: (process.env.SMTP_SECURE || "true") === "true",
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          // Strict timeouts (4 seconds) to guarantee Vercel serverless function never times out (10s limit)
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 4000,
        });

        await transporter.sendMail({
          from: `"TEDxGCEM Inbox" <${smtpUser}>`,
          to: adminEmail,
          replyTo: user.email,
          subject: mailSubject,
          text: mailText,
          html: mailHtml,
        });
      } catch (emailErr) {
        console.warn("SMTP email transmission failed, but record was saved to database:", emailErr);
      }
    } else {
      console.info("Neither RESEND_API_KEY nor SMTP credentials configured. Email notification skipped, record successfully saved in database.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Server Contact submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
