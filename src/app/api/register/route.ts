import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify user authentication server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized. Please sign in with Google." }, { status: 401 });
    }

    const { fullName, phone, organization, linkedin } = await request.json();

    if (!fullName || !phone || !organization) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Insert registration record into Supabase using the authenticated user's credentials
    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      email: user.email,
      phone,
      organization,
      linkedin,
      user_id: user.id,
      ticket_status: "pending_approval",
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Server Registration submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit registration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
