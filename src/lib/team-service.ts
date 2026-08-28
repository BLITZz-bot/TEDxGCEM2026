// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";
import { isValidUUID } from "@/lib/db/uuid-validator";

// â”€â”€â”€ Domain type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface TeamMember {
  id: string;
  created_at?: string;
  name: string;
  role: string;
  /** Holds a base64-encoded image data string */
  image_url: string;
  email?: string;
  linkedin?: string;
  bio: string;
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TEAM_FILE_PATH = path.join(process.cwd(), "data", "team.json");
const DEFAULT_TEAM: TeamMember[] = [];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function readLocal(): TeamMember[] {
  return readLocalStore<TeamMember>(TEAM_FILE_PATH, DEFAULT_TEAM);
}

async function saveLocal(members: TeamMember[]): Promise<void> {
  saveLocalStore<TeamMember>(TEAM_FILE_PATH, members);
}

// â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getTeamMembers(): Promise<TeamMember[]> {
  // 1. Try Supabase first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("[team-service] Supabase fetch error, falling back to local file:", err);
  }

  // 2. Fallback to local file
  return readLocal();
}

/** @internal — write-through to local JSON after every mutation */
export async function saveTeamLocalFallback(members: TeamMember[]): Promise<void> {
  await saveLocal(members);
}

export async function addTeamMember(member: Omit<TeamMember, "id">): Promise<boolean> {
  let newId = Math.random().toString(36).substring(2, 9);

  // 1. Persist to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("team_members").insert([member]).select();

    if (!error && data && data.length > 0) {
      newId = data[0].id;
    } else {
      console.warn("[team-service] Supabase insert error:", error);
    }
  } catch (err) {
    console.warn("[team-service] Supabase insert connection error:", err);
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal();
    current.push({ id: newId, ...member });
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[team-service] Local file append error:", err);
    return false;
  }
}

export async function updateTeamMember(member: TeamMember): Promise<boolean> {
  // 1. Update in Supabase (only if record has a real UUID)
  if (isValidUUID(member.id)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("team_members")
        .update({
          name: member.name,
          role: member.role,
          image_url: member.image_url,
          email: member.email,
          linkedin: member.linkedin,
          bio: member.bio,
        })
        .eq("id", member.id);

      if (error) {
        console.warn("[team-service] Supabase update error:", error);
      }
    } catch (err) {
      console.warn("[team-service] Supabase update connection error:", err);
    }
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal().map((m) => (m.id === member.id ? member : m));
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[team-service] Local file update error:", err);
    return false;
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  // 1. Delete from Supabase (only if record has a real UUID)
  if (isValidUUID(id)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("team_members").delete().eq("id", id);

      if (error) {
        console.warn("[team-service] Supabase delete error:", error);
      }
    } catch (err) {
      console.warn("[team-service] Supabase delete connection error:", err);
    }
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal().filter((m) => m.id !== id);
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[team-service] Local file delete error:", err);
    return false;
  }
}
