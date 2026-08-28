// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";
import { isValidUUID } from "@/lib/db/uuid-validator";

// â”€â”€â”€ Domain type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface Speaker {
  id: string;
  created_at?: string;
  name: string;
  designation: string;
  /** Holds a base64-encoded image data string */
  image_url: string;
  email?: string;
  linkedin?: string;
  instagram?: string;
  bio: string;
  details: string;
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SPEAKERS_FILE_PATH = path.join(process.cwd(), "data", "speakers.json");
const DEFAULT_SPEAKERS: Speaker[] = [];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function readLocal(): Speaker[] {
  return readLocalStore<Speaker>(SPEAKERS_FILE_PATH, DEFAULT_SPEAKERS);
}

async function saveLocal(speakers: Speaker[]): Promise<void> {
  saveLocalStore<Speaker>(SPEAKERS_FILE_PATH, speakers);
}

// â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getSpeakers(): Promise<Speaker[]> {
  // 1. Try Supabase first
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
    console.warn("[speakers-service] Supabase fetch error, falling back to local file:", err);
  }

  // 2. Fallback to local file
  return readLocal();
}

/** @internal — write-through to local JSON after every mutation */
export async function saveSpeakersLocalFallback(speakers: Speaker[]): Promise<void> {
  await saveLocal(speakers);
}

export async function addSpeaker(speaker: Omit<Speaker, "id">): Promise<boolean> {
  let newId = Math.random().toString(36).substring(2, 9);

  // 1. Persist to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("speakers").insert([speaker]).select();

    if (!error && data && data.length > 0) {
      newId = data[0].id;
    } else {
      console.warn("[speakers-service] Supabase insert error:", error);
    }
  } catch (err) {
    console.warn("[speakers-service] Supabase insert connection error:", err);
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal();
    current.push({ id: newId, ...speaker });
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[speakers-service] Local file append error:", err);
    return false;
  }
}

export async function updateSpeaker(speaker: Speaker): Promise<boolean> {
  // 1. Update in Supabase (only if record has a real UUID)
  if (isValidUUID(speaker.id)) {
    try {
      const supabase = await createClient();
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
          details: speaker.details,
        })
        .eq("id", speaker.id);

      if (error) {
        console.warn("[speakers-service] Supabase update error:", error);
      }
    } catch (err) {
      console.warn("[speakers-service] Supabase update connection error:", err);
    }
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal().map((s) => (s.id === speaker.id ? speaker : s));
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[speakers-service] Local file update error:", err);
    return false;
  }
}

export async function deleteSpeaker(id: string): Promise<boolean> {
  // 1. Delete from Supabase (only if record has a real UUID)
  if (isValidUUID(id)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("speakers").delete().eq("id", id);

      if (error) {
        console.warn("[speakers-service] Supabase delete error:", error);
      }
    } catch (err) {
      console.warn("[speakers-service] Supabase delete connection error:", err);
    }
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal().filter((s) => s.id !== id);
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[speakers-service] Local file delete error:", err);
    return false;
  }
}
