import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { 
  getPartners, 
  addPartner, 
  updatePartner, 
  deletePartner,
  Partner 
} from "@/lib/partners-service";

export const dynamic = "force-dynamic";

async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  try {
    const partners = await getPartners();
    return NextResponse.json({ partners });
  } catch (error: unknown) {
    console.error("Partners GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load partners.";
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
    const { id, name, role, level, logo, description, email, phone } = body;

    // Validation
    if (
      typeof name !== "string" ||
      typeof role !== "string" ||
      typeof logo !== "string" ||
      typeof description !== "string" ||
      (level !== undefined && level !== null && typeof level !== "string") ||
      (email !== undefined && email !== null && typeof email !== "string") ||
      (phone !== undefined && phone !== null && typeof phone !== "string")
    ) {
      return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
    }

    let success = false;
    if (id) {
      // Update
      const partnerToUpdate: Partner = {
        id,
        name,
        role,
        level: level || "Silver",
        logo,
        description,
        email: email || "",
        phone: phone || ""
      };
      success = await updatePartner(partnerToUpdate);
    } else {
      // Add new
      const partnerToAdd: Omit<Partner, "id"> = {
        name,
        role,
        level: level || "Silver",
        logo,
        description,
        email: email || "",
        phone: phone || ""
      };
      success = await addPartner(partnerToAdd);
    }
    if (!success) {
      throw new Error("Failed to save partner to storage backend.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Partners POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to save partner.";
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
      return NextResponse.json({ error: "Missing partner ID." }, { status: 400 });
    }

    const success = await deletePartner(id);
    if (!success) {
      throw new Error("Failed to delete partner from storage backend.");
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Partners DELETE error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete partner.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
