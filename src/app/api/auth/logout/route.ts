import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Server Logout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
