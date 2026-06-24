import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verify user authentication server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Check if tickets/passes are open for download
    const { getSettings } = await import("@/lib/settings-service");
    const settings = await getSettings();
    if (settings.reveal_tickets === false) {
      return NextResponse.json({ error: "Ticket downloads are currently closed." }, { status: 403 });
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
  } catch (error: unknown) {
    console.error("Server Pass fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pass.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
