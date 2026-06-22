import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verify user authentication server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Query registration details based on server session email
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ registration: data });
  } catch (error: any) {
    console.error("Server Pass fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch pass." }, { status: 500 });
  }
}
