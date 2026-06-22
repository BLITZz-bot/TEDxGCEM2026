import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ isAdmin: false });
    }

    // Keep the admin email strictly on the server
    const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";
    const isAdmin = user.email.toLowerCase() === adminEmail.toLowerCase();

    return NextResponse.json(
      { isAdmin },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Admin check server error:", error);
    return NextResponse.json(
      { isAdmin: false },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  }
}
