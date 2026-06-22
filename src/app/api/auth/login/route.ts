import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ url: data.url });
  } catch (error: unknown) {
    console.error("Server Login error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Google Sign-In URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
