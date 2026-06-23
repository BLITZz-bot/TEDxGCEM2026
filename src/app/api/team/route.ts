import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  getTeamMembers, 
  addTeamMember, 
  updateTeamMember, 
  deleteTeamMember,
  TeamMember 
} from "@/lib/team-service";

export const dynamic = "force-dynamic";

async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  try {
    const team = await getTeamMembers();
    return NextResponse.json({ team });
  } catch (error: unknown) {
    console.error("Team GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load team members.";
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
    const { id, name, role, image_url, email, linkedin, bio } = body;

    // Validation
    if (
      typeof name !== "string" ||
      typeof role !== "string" ||
      typeof image_url !== "string" ||
      typeof bio !== "string" ||
      (email !== undefined && email !== null && typeof email !== "string") ||
      (linkedin !== undefined && linkedin !== null && typeof linkedin !== "string")
    ) {
      return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
    }

    let success = false;
    if (id) {
      // Update
      const memberToUpdate: TeamMember = {
        id,
        name,
        role,
        image_url,
        email: email || "",
        linkedin: linkedin || "",
        bio
      };
      success = await updateTeamMember(memberToUpdate);
    } else {
      // Add new
      const memberToAdd: Omit<TeamMember, "id"> = {
        name,
        role,
        image_url,
        email: email || "",
        linkedin: linkedin || "",
        bio
      };
      success = await addTeamMember(memberToAdd);
    }

    if (!success) {
      throw new Error("Failed to save team member to storage backend.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Team POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to save team member.";
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
      return NextResponse.json({ error: "Missing member ID." }, { status: 400 });
    }

    const success = await deleteTeamMember(id);
    if (!success) {
      throw new Error("Failed to delete team member from storage backend.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Team DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete team member.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
