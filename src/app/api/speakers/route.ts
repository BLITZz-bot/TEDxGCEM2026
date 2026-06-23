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
  const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  try {
    const speakers = await getSpeakers();
    return NextResponse.json({ speakers });
  } catch (error: unknown) {
    console.error("Speakers GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load speakers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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
      return NextResponse.json({ error: "Invalid parameters.", details: { name, designation, image_url, bio, details } }, { status: 400 });
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
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing speaker ID." }, { status: 400 });
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
