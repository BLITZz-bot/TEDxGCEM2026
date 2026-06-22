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

    const { name, message } = await request.json();

    if (!name || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Insert message record into Supabase using the authenticated user's credentials
    const { error } = await supabase.from("messages").insert({
      name,
      email: user.email,
      message,
      user_id: user.id,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Server Contact submission error:", error);
    const message = error instanceof Error ? error.message : "Failed to submit message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
