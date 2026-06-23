import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSettings, saveSettings, EventSettings } from "@/lib/settings-service";

export const dynamic = "force-dynamic";

async function checkAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL || "tedxgcem@gmail.com";
  return user.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (error: unknown) {
    console.error("Settings GET error:", error);
    const message = error instanceof Error ? error.message : "Failed to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { theme_name, reveal_theme, reveal_date, reveal_countdown, event_date, event_time, event_day, countdown_target, about_theme_name, about_theme_desc, reveal_about_theme, reveal_team, reveal_speakers } = body;

    // Validation
    if (
      typeof theme_name !== "string" ||
      typeof reveal_theme !== "boolean" ||
      typeof reveal_date !== "boolean" ||
      typeof reveal_countdown !== "boolean" ||
      typeof event_date !== "string" ||
      typeof event_time !== "string" ||
      typeof event_day !== "string" ||
      typeof countdown_target !== "string" ||
      typeof about_theme_name !== "string" ||
      typeof about_theme_desc !== "string" ||
      typeof reveal_about_theme !== "boolean" ||
      typeof reveal_team !== "boolean" ||
      typeof reveal_speakers !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid parameters." }, { status: 400 });
    }

    const settingsToSave: EventSettings = {
      theme_name,
      reveal_theme,
      reveal_date,
      reveal_countdown,
      event_date,
      event_time,
      event_day,
      countdown_target,
      about_theme_name,
      about_theme_desc,
      reveal_about_theme,
      reveal_team,
      reveal_speakers,
    };

    const success = await saveSettings(settingsToSave);
    if (!success) {
      throw new Error("Failed to save settings to backend storage.");
    }

    return NextResponse.json({ success: true, settings: settingsToSave });
  } catch (error: unknown) {
    console.error("Settings POST error:", error);
    const message = error instanceof Error ? error.message : "Failed to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
