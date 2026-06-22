import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error("Server Login error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
