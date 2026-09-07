// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordComplimentaryPassDownload } from "@/lib/complimentary-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const passCode = typeof body.passCode === "string" ? body.passCode.trim() : "";
    const userEmail = user?.email || "";

    if (!passCode && !userEmail) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    // 1. Try recording as Special Guest Pass
    const result = await recordComplimentaryPassDownload(passCode, userEmail);
    if (result.success) {
      return NextResponse.json({ success: true, count: result.count, type: "complimentary" });
    }

    // 2. Also record for standard registration if applicable
    if (userEmail) {
      try {
        const { data: reg } = await supabase
          .from("registrations")
          .select("id, download_count")
          .or(`email.ilike.${userEmail},buyer_email.ilike.${userEmail}`)
          .limit(1)
          .maybeSingle();

        if (reg) {
          const newCount = (Number(reg.download_count) || 0) + 1;
          const now = new Date().toISOString();
          await supabase
            .from("registrations")
            .update({ download_count: newCount, downloaded_at: now })
            .eq("id", reg.id);
          return NextResponse.json({ success: true, count: newCount, type: "registration" });
        }
      } catch (regErr) {
        console.warn("[track-download] Standard registration update notice:", regErr);
      }
    }

    return NextResponse.json({ success: true, count: 1 });
  } catch (err) {
    console.error("Pass download tracking error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
