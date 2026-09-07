// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import { getComplimentaryPasses, updateComplimentaryPass } from "@/lib/complimentary-service";
import { sendSpecialGuestPassEmail } from "@/lib/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing pass ID." }, { status: 400 });
    }

    const allPasses = await getComplimentaryPasses();
    const pass = allPasses.find((p) => p.id === id);

    if (!pass) {
      return NextResponse.json({ error: "Pass record not found." }, { status: 404 });
    }

    const emailResult = await sendSpecialGuestPassEmail({
      guestName: pass.full_name,
      guestEmail: pass.email,
      passCode: pass.pass_code,
    });

    const updatedPass = await updateComplimentaryPass(pass.id, {
      email_status: emailResult.success ? "sent" : "failed",
    });

    return NextResponse.json({
      success: true,
      emailSent: !!emailResult.success,
      pass: updatedPass || pass,
    });
  } catch (error) {
    console.error("Resend special guest pass error:", error);
    return NextResponse.json({ error: "Failed to resend pass email." }, { status: 500 });
  }
}
