// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";
import { isValidUUID } from "@/lib/db/uuid-validator";

// ─── Domain type ─────────────────────────────────────────────────────────────

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
  display_order?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TEAM_FILE_PATH = path.join(process.cwd(), "data", "team.json");
const DEFAULT_TEAM: TeamMember[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readLocal(): TeamMember[] {
  return readLocalStore<TeamMember>(TEAM_FILE_PATH, DEFAULT_TEAM);
}

async function saveLocal(members: TeamMember[]): Promise<void> {
  saveLocalStore<TeamMember>(TEAM_FILE_PATH, members);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<TeamMember[]> {
  // BYPASS SUPABASE: Return static INITIAL_MEMBERS to disconnect from database as requested
  const { INITIAL_MEMBERS } = require("@/lib/members-data");
  return INITIAL_MEMBERS.map((m: any, index: number) => {
    let photo = m.photoUrl;
    const lowerName = (m.name || '').toLowerCase();
    const lowerSlug = (m.slug || '').toLowerCase();
    if (lowerName.includes('vinayaka') || lowerSlug.includes('vinayak')) {
      photo = '/VINAYAKA V.png';
    } else if (lowerName.includes('yeshwanth') || lowerSlug.includes('yeshwanth') || lowerSlug === 'itz.yez' || lowerSlug === 'itz-yez') {
      photo = '/YESHWANTH.png';
    }
    return {
      id: m.slug,
      name: m.name,
      role: m.role,
      image_url: photo,
      email: m.email || undefined,
      linkedin: m.linkedin || undefined,
      bio: m.bio,
      display_order: index,
    };
  });

  // 1. Try Supabase first
  try {
    const supabase = await createClient();
    let data: TeamMember[] | null = null;
    let error: unknown = null;

    const res = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (!res.error && Array.isArray(res.data)) {
      data = res.data;
    } else {
      // Fallback to created_at if display_order column doesn't exist yet
      const fallback = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });
      if (!fallback.error && Array.isArray(fallback.data)) {
        data = fallback.data;
      } else {
        error = res.error || fallback.error;
      }
    }

    if (!error && Array.isArray(data) && (data as TeamMember[]).length > 0) {
      return (data as TeamMember[]).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }
  } catch (err) {
    console.warn("[team-service] Supabase fetch error, falling back to local file:", err);
  }

  // 2. Fallback to local file
  const local = readLocal();
  return local.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/** @internal — write-through to local JSON after every mutation */
export async function saveTeamLocalFallback(members: TeamMember[]): Promise<void> {
  await saveLocal(members);
}

export async function addTeamMember(member: Omit<TeamMember, "id">): Promise<boolean> {
  let newId = crypto.randomUUID();
  const current = readLocal();
  const defaultOrder = current.length > 0 
    ? Math.max(...current.map(m => (typeof m.display_order === "number" ? m.display_order : 0))) + 1 
    : 1;
  const memberWithOrder: Omit<TeamMember, "id"> = {
    ...member,
    display_order: member.display_order !== undefined && member.display_order !== null ? member.display_order : defaultOrder,
  };

  // 1. Persist to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("team_members").insert([memberWithOrder]).select();

    if (!error && data && data.length > 0) {
      newId = data[0].id;
    } else {
      console.warn("[team-service] Supabase insert with display_order failed, trying without:", error);
      // If display_order column does not exist in Supabase yet, retry without it
      const { display_order: _, ...memberWithoutOrder } = memberWithOrder;
      const retry = await supabase.from("team_members").insert([memberWithoutOrder]).select();
      if (!retry.error && retry.data && retry.data.length > 0) {
        newId = retry.data[0].id;
      }
    }
  } catch (err) {
    console.warn("[team-service] Supabase insert connection error:", err);
  }

  // 2. Write-through to local fallback
  try {
    current.push({ id: newId, ...memberWithOrder });
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
      const updatePayload: Record<string, unknown> = {
        name: member.name,
        role: member.role,
        image_url: member.image_url,
        email: member.email,
        linkedin: member.linkedin,
        bio: member.bio,
      };
      if (member.display_order !== undefined) {
        updatePayload.display_order = member.display_order;
      }

      const { error } = await supabase
        .from("team_members")
        .update(updatePayload)
        .eq("id", member.id);

      if (error) {
        console.warn("[team-service] Supabase update error:", error);
        if (member.display_order !== undefined) {
          delete updatePayload.display_order;
          await supabase.from("team_members").update(updatePayload).eq("id", member.id);
        }
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

export async function reorderTeamMembers(orderedIds: string[]): Promise<boolean> {
  try {
    const current = readLocal();
    const idToMember = new Map(current.map((m) => [m.id, m]));
    const updated: TeamMember[] = [];

    orderedIds.forEach((id, idx) => {
      const m = idToMember.get(id);
      if (m) {
        updated.push({ ...m, display_order: idx + 1 });
        idToMember.delete(id);
      }
    });

    // Any unlisted members appended to the end
    let nextOrder = updated.length + 1;
    idToMember.forEach((m) => {
      updated.push({ ...m, display_order: nextOrder++ });
    });

    await saveLocal(updated);

    // Sync to Supabase
    try {
      const supabase = await createClient();
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (isValidUUID(id)) {
          await supabase
            .from("team_members")
            .update({ display_order: i + 1 })
            .eq("id", id);
        }
      }
    } catch (err) {
      console.warn("[team-service] Supabase reorder sync error:", err);
    }

    return true;
  } catch (err) {
    console.error("[team-service] reorderTeamMembers error:", err);
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
