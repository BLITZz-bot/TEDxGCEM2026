// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { reorderTeamMembers } from "@/lib/team-service";

export const dynamic = "force-dynamic";

async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function POST(request: Request) {
  try {
    let isAdminUser = false;
    try {
      const supabase = await createClient();
      isAdminUser = await checkAdmin(supabase);
    } catch {
      // Supabase unreachable
    }
    if (!isAdminUser) {
      const adminEmail = process.env.ADMIN_EMAIL || "";
      if (adminEmail !== "") {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
      return NextResponse.json(
        { error: "Invalid parameters. 'orderedIds' must be an array of team member IDs." },
        { status: 400 }
      );
    }

    const success = await reorderTeamMembers(orderedIds);
    if (!success) {
      throw new Error("Failed to update team member positions.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Team Reorder POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to reorder team members.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
