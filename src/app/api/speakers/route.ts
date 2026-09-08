// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  getSpeakers, 
  addSpeaker, 
  updateSpeaker, 
  deleteSpeaker,
  Speaker 
} from "@/lib/speakers-service";

export const dynamic = "force-dynamic";

async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  try {
    const speakers = await getSpeakers();
    return NextResponse.json(
      { speakers },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Speakers GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load speakers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Try Supabase admin check first; fall back gracefully if session unavailable.
    let isAdminUser = false;
    try {
      const supabase = await createClient();
      isAdminUser = await checkAdmin(supabase);
    } catch {
      // Supabase unreachable — fall through to secondary check
    }

    if (!isAdminUser) {
      const adminEmail = process.env.ADMIN_EMAIL || "";
      if (adminEmail !== "") {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }
    const body = await request.json();
    const { id, name, designation, image_url, email, linkedin, instagram, bio, details } = body;

    // Validation
    if (
      typeof name !== "string" ||
      typeof designation !== "string" ||
      typeof image_url !== "string" ||
      typeof bio !== "string" ||
      typeof details !== "string" ||
      (email !== undefined && email !== null && typeof email !== "string") ||
      (linkedin !== undefined && linkedin !== null && typeof linkedin !== "string") ||
      (instagram !== undefined && instagram !== null && typeof instagram !== "string")
    ) {
      return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
    }

    let success = false;
    if (id) {
      // Update
      const speakerToUpdate: Speaker = {
        id,
        name,
        designation,
        image_url,
        email: email || "",
        linkedin: linkedin || "",
        instagram: instagram || "",
        bio,
        details
      };
      success = await updateSpeaker(speakerToUpdate);
    } else {
      // Add new
      const speakerToAdd: Omit<Speaker, "id"> = {
        name,
        designation,
        image_url,
        email: email || "",
        linkedin: linkedin || "",
        instagram: instagram || "",
        bio,
        details
      };
      success = await addSpeaker(speakerToAdd);
    }
    if (!success) {
      throw new Error("Failed to save speaker to storage backend.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Speakers POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to save speaker.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing speaker ID." }, { status: 400 });
    }

    // Try Supabase admin check first; fall back to local-only delete if
    // session is unavailable (e.g. cookie not forwarded in some environments).
    let isAdminUser = false;
    try {
      const supabase = await createClient();
      isAdminUser = await checkAdmin(supabase);
    } catch {
      // Supabase unreachable — will fall through to local-only path below
    }

    if (!isAdminUser) {
      // Secondary check: allow if ADMIN_EMAIL is unset (local dev / fallback)
      const adminEmail = process.env.ADMIN_EMAIL || "";
      if (adminEmail !== "") {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }

    const success = await deleteSpeaker(id);
    if (!success) {
      throw new Error("Failed to delete speaker from storage backend.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Speakers DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete speaker.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
