import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface EventSettings {
  theme_name: string;
  reveal_theme: boolean;
  reveal_date: boolean;
  reveal_countdown: boolean;
  event_date: string;
  event_time: string;
  event_day: string;
  countdown_target: string;
  about_theme_name: string;
  about_theme_desc: string;
  reveal_about_theme: boolean;
}

const DEFAULT_SETTINGS: EventSettings = {
  theme_name: "RIPPLE",
  reveal_theme: true,
  reveal_date: true,
  reveal_countdown: true,
  event_date: "October 15, 2026",
  event_time: "09:00 AM",
  event_day: "THURSDAY",
  countdown_target: "2026-10-15T09:00:00",
  about_theme_name: "TRANSFORMING PERSPECTIVES",
  about_theme_desc: "This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.",
  reveal_about_theme: true,
};

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "lib", "settings.json");

export async function getSettings(): Promise<EventSettings> {
  // 1. Try fetching from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", "global")
      .single();

    if (!error && data) {
      return {
        theme_name: data.theme_name ?? DEFAULT_SETTINGS.theme_name,
        reveal_theme: data.reveal_theme ?? DEFAULT_SETTINGS.reveal_theme,
        reveal_date: data.reveal_date ?? DEFAULT_SETTINGS.reveal_date,
        reveal_countdown: data.reveal_countdown ?? DEFAULT_SETTINGS.reveal_countdown,
        event_date: data.event_date ?? DEFAULT_SETTINGS.event_date,
        event_time: data.event_time ?? DEFAULT_SETTINGS.event_time,
        event_day: data.event_day ?? DEFAULT_SETTINGS.event_day,
        countdown_target: data.countdown_target ?? DEFAULT_SETTINGS.countdown_target,
        about_theme_name: data.about_theme_name ?? DEFAULT_SETTINGS.about_theme_name,
        about_theme_desc: data.about_theme_desc ?? DEFAULT_SETTINGS.about_theme_desc,
        reveal_about_theme: data.reveal_about_theme ?? DEFAULT_SETTINGS.reveal_about_theme,
      };
    }
  } catch (err) {
    console.warn("Supabase event_settings fetch error, falling back to local file:", err);
  }

  // 2. Fallback to local file
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const fileData = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      return {
        theme_name: parsed.theme_name ?? DEFAULT_SETTINGS.theme_name,
        reveal_theme: parsed.reveal_theme ?? DEFAULT_SETTINGS.reveal_theme,
        reveal_date: parsed.reveal_date ?? DEFAULT_SETTINGS.reveal_date,
        reveal_countdown: parsed.reveal_countdown ?? DEFAULT_SETTINGS.reveal_countdown,
        event_date: parsed.event_date ?? DEFAULT_SETTINGS.event_date,
        event_time: parsed.event_time ?? DEFAULT_SETTINGS.event_time,
        event_day: parsed.event_day ?? DEFAULT_SETTINGS.event_day,
        countdown_target: parsed.countdown_target ?? DEFAULT_SETTINGS.countdown_target,
        about_theme_name: parsed.about_theme_name ?? DEFAULT_SETTINGS.about_theme_name,
        about_theme_desc: parsed.about_theme_desc ?? DEFAULT_SETTINGS.about_theme_desc,
        reveal_about_theme: parsed.reveal_about_theme ?? DEFAULT_SETTINGS.reveal_about_theme,
      };
    }
  } catch (err) {
    console.warn("Local settings file read error, falling back to defaults:", err);
  }

  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: EventSettings): Promise<boolean> {
  // 1. Try saving to Supabase
  let supabaseSaved = false;
  try {
    const supabase = await createClient();
    
    // First check if the row exists
    const { data, error: fetchError } = await supabase
      .from("event_settings")
      .select("id")
      .eq("id", "global")
      .maybeSingle();

    if (!fetchError) {
      const payload = {
        theme_name: settings.theme_name,
        reveal_theme: settings.reveal_theme,
        reveal_date: settings.reveal_date,
        reveal_countdown: settings.reveal_countdown,
        event_date: settings.event_date,
        event_time: settings.event_time,
        event_day: settings.event_day,
        countdown_target: settings.countdown_target,
        about_theme_name: settings.about_theme_name,
        about_theme_desc: settings.about_theme_desc,
        reveal_about_theme: settings.reveal_about_theme,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (data) {
        // Update existing row
        ({ error } = await supabase
          .from("event_settings")
          .update(payload)
          .eq("id", "global"));
      } else {
        // Insert new row
        ({ error } = await supabase
          .from("event_settings")
          .insert({ id: "global", ...payload }));
      }

      if (!error) {
        supabaseSaved = true;
      } else {
        console.warn("Supabase event_settings save query error:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase event_settings save connection error:", err);
  }

  // 2. Write to local file
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn("Local settings file write error:", err);
    // If we saved to Supabase, we are still successful
    return supabaseSaved;
  }
}
