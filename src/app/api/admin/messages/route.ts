import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Helper to check if current logged-in user is admin
async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error: any) {
    console.error("Admin messages GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to load messages." }, { status: 500 });
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
      return NextResponse.json({ error: "Missing message ID." }, { status: 400 });
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin messages DELETE error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete message." }, { status: 500 });
  }
}
