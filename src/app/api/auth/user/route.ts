import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    return NextResponse.json({ user: user || null });
  } catch (error) {
    console.error("Server fetch user error:", error);
    return NextResponse.json({ user: null });
  }
}
