// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import {
  getComplimentaryPasses,
  createComplimentaryPass,
  updateComplimentaryPass,
  deleteComplimentaryPass,
} from "@/lib/complimentary-service";
import { sendSpecialGuestPassEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const passes = await getComplimentaryPasses();
    return NextResponse.json({ passes });
  } catch (error) {
    console.error("Admin complimentary passes GET error:", error);
    return NextResponse.json({ error: "Failed to load complimentary passes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { fullName, email, phone, note } = body;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required." }, { status: 400 });
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    // 1. Create the pass record
    const pass = await createComplimentaryPass({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      note: typeof note === "string" ? note.trim() : "",
      emailStatus: "pending",
    });

    // 2. Dispatch the invitation email
    let emailSent = false;
    try {
      const emailResult = await sendSpecialGuestPassEmail({
        guestName: pass.full_name,
        guestEmail: pass.email,
        passCode: pass.pass_code,
      });
      emailSent = !!emailResult.success;
    } catch (mailErr) {
      console.error("Error dispatching special guest pass email:", mailErr);
    }

    const finalPass = await updateComplimentaryPass(pass.id, {
      email_status: emailSent ? "sent" : "failed",
    });

    return NextResponse.json({
      success: true,
      pass: finalPass || pass,
      emailSent,
    });
  } catch (error) {
    console.error("Admin complimentary pass creation error:", error);
    return NextResponse.json({ error: "Failed to create complimentary pass." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { id, fullName, email, phone, note } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Pass ID is required." }, { status: 400 });
    }

    const updates: Parameters<typeof updateComplimentaryPass>[1] = {};
    if (typeof fullName === "string" && fullName.trim()) updates.full_name = fullName.trim();
    if (typeof email === "string" && email.trim() && email.includes("@")) updates.email = email.trim().toLowerCase();
    if (typeof phone === "string" && phone.trim()) updates.phone = phone.trim();
    if (typeof note === "string") updates.note = note.trim();

    const updated = await updateComplimentaryPass(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Pass record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, pass: updated });
  } catch (error) {
    console.error("Admin complimentary pass PUT error:", error);
    return NextResponse.json({ error: "Failed to update pass record." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    // Server-side Admin Deletion Password Verification
    const configuredDeletePassword = process.env.ADMIN_DELETE_PASSWORD;
    const clientProvidedPassword = request.headers.get("x-admin-delete-password");

    if (configuredDeletePassword) {
      if (!clientProvidedPassword || clientProvidedPassword !== configuredDeletePassword) {
        return NextResponse.json(
          { error: "Incorrect admin deletion password. Deletion unauthorized." },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Server error: ADMIN_DELETE_PASSWORD is not configured in server environment variables." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing pass ID." }, { status: 400 });
    }

    await deleteComplimentaryPass(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin complimentary pass DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete record.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
