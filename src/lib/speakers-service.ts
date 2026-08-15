import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface Speaker {
  id: string;
  created_at?: string;
  name: string;
  designation: string;
  image_url: string; // holds base64 data string
  email?: string;
  linkedin?: string;
  instagram?: string;
  bio: string;
  details: string;
}

const SPEAKERS_FILE_PATH = path.join(process.cwd(), "src", "lib", "speakers.json");

// Default/Seed Speakers
const DEFAULT_SPEAKERS: Speaker[] = [];

export async function getSpeakers(): Promise<Speaker[]> {
  // 1. Try from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase speakers fetch error, falling back to local file:", err);
  }

  // 2. Try local file
  try {
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      const fileData = fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Local speakers file read error, returning defaults:", err);
  }

  return DEFAULT_SPEAKERS;
}

export async function saveSpeakersLocalFallback(speakers: Speaker[]): Promise<void> {
  try {
    fs.writeFileSync(SPEAKERS_FILE_PATH, JSON.stringify(speakers, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local speakers JSON fallback:", err);
  }
}

export async function addSpeaker(speaker: Omit<Speaker, "id">): Promise<boolean> {
  let supabaseSaved = false;
  let newId = Math.random().toString(36).substring(2, 9); // Fallback ID

  // 1. Save to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("speakers")
      .insert([speaker])
      .select();

    if (!error && data && data.length > 0) {
      supabaseSaved = true;
      newId = data[0].id;
    } else {
      console.warn("Supabase add speaker error:", error);
    }
  } catch (err) {
    console.warn("Supabase add speaker connection error:", err);
  }

  // 2. Read existing local list, append new speaker, and save
  try {
    let currentSpeakers: Speaker[] = [];
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      currentSpeakers = JSON.parse(fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8"));
    } else {
      currentSpeakers = [...DEFAULT_SPEAKERS];
    }
    const newSpeaker: Speaker = {
      id: newId,
      ...speaker
    };
    currentSpeakers.push(newSpeaker);
    await saveSpeakersLocalFallback(currentSpeakers);
    return true;
  } catch (err) {
    console.error("Local speakers file append error:", err);
    return supabaseSaved;
  }
}

export async function updateSpeaker(speaker: Speaker): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Save to Supabase (only if ID is a valid UUID)
  try {
    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(speaker.id);
    if (isUUID) {
      const { error } = await supabase
        .from("speakers")
        .update({
          name: speaker.name,
          designation: speaker.designation,
          image_url: speaker.image_url,
          email: speaker.email,
          linkedin: speaker.linkedin,
          instagram: speaker.instagram,
          bio: speaker.bio,
          details: speaker.details
        })
        .eq("id", speaker.id);

      if (!error) {
        supabaseSaved = true;
      } else {
        console.warn("Supabase update speaker error:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase update speaker connection error:", err);
  }

  // 2. Update local file
  try {
    let currentSpeakers: Speaker[] = [];
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      currentSpeakers = JSON.parse(fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8"));
    } else {
      currentSpeakers = [...DEFAULT_SPEAKERS];
    }
    currentSpeakers = currentSpeakers.map(s => s.id === speaker.id ? speaker : s);
    await saveSpeakersLocalFallback(currentSpeakers);
    return true;
  } catch (err) {
    console.error("Local speakers file update error:", err);
    return supabaseSaved;
  }
}

export async function deleteSpeaker(id: string): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Delete from Supabase (only if ID is a valid UUID)
  try {
    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      const { error } = await supabase
        .from("speakers")
        .delete()
        .eq("id", id);

      if (!error) {
        supabaseSaved = true;
      } else {
        console.warn("Supabase delete speaker error:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase delete speaker connection error:", err);
  }

  // 2. Update local file
  try {
    let currentSpeakers: Speaker[] = [];
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      currentSpeakers = JSON.parse(fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8"));
    } else {
      currentSpeakers = [...DEFAULT_SPEAKERS];
    }
    currentSpeakers = currentSpeakers.filter(s => s.id !== id);
    await saveSpeakersLocalFallback(currentSpeakers);
    return true;
  } catch (err) {
    console.error("Local speakers file delete error:", err);
    return supabaseSaved;
  }
}
