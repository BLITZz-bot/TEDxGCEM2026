// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";
import { isValidUUID } from "@/lib/db/uuid-validator";

// ─── Domain type ─────────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  created_at?: string;
  name: string;
  role: string;
  /** Sponsorship tier: "Platinum", "Gold", "Silver", etc. */
  level: string;
  /** Holds a base64-encoded image data string or a URL path */
  logo: string;
  description: string;
  email?: string;
  phone?: string;
  instagram?: string;
  linkedin?: string;
  display_order?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PARTNERS_FILE_PATH = path.join(process.cwd(), "data", "partners.json");
const DEFAULT_PARTNERS: Partner[] = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readLocal(): Partner[] {
  return readLocalStore<Partner>(PARTNERS_FILE_PATH, DEFAULT_PARTNERS);
}

async function saveLocal(partners: Partner[]): Promise<void> {
  saveLocalStore<Partner>(PARTNERS_FILE_PATH, partners);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getPartners(): Promise<Partner[]> {
  // 1. Try Supabase first
  try {
    const supabase = await createClient();
    let data: Partner[] | null = null;
    let error: unknown = null;

    const res = await supabase
      .from("partners")
      .select("*")
      .order("display_order", { ascending: true });

    if (!res.error && Array.isArray(res.data)) {
      data = res.data;
    } else {
      // Fallback to created_at if display_order column doesn't exist yet
      const fallback = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: true });
      if (!fallback.error && Array.isArray(fallback.data)) {
        data = fallback.data;
      } else {
        error = res.error || fallback.error;
      }
    }

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }
  } catch (err) {
    console.warn("[partners-service] Supabase fetch error, falling back to local file:", err);
  }

  // 2. Fallback to local file
  const local = readLocal();
  return local.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

/** @internal — write-through to local JSON after every mutation */
export async function savePartnersLocalFallback(partners: Partner[]): Promise<void> {
  await saveLocal(partners);
}

export async function addPartner(partner: Omit<Partner, "id">): Promise<boolean> {
  let newId = crypto.randomUUID();
  const current = readLocal();
  const defaultOrder = current.length > 0 
    ? Math.max(...current.map(p => (typeof p.display_order === "number" ? p.display_order : 0))) + 1 
    : 1;
  const partnerWithOrder: Omit<Partner, "id"> = {
    ...partner,
    display_order: partner.display_order !== undefined && partner.display_order !== null ? partner.display_order : defaultOrder,
  };

  // 1. Persist to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("partners").insert([partnerWithOrder]).select();

    if (!error && data && data.length > 0) {
      newId = data[0].id;
    } else {
      console.warn("[partners-service] Supabase insert with display_order failed, trying without:", error);
      // If display_order column does not exist in Supabase yet, retry without it
      const { display_order: _, ...partnerWithoutOrder } = partnerWithOrder;
      const retry = await supabase.from("partners").insert([partnerWithoutOrder]).select();
      if (!retry.error && retry.data && retry.data.length > 0) {
        newId = retry.data[0].id;
      }
    }
  } catch (err) {
    console.warn("[partners-service] Supabase insert connection error:", err);
  }

  // 2. Write-through to local fallback
  try {
    current.push({ id: newId, ...partnerWithOrder });
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[partners-service] Local file append error:", err);
    return false;
  }
}

export async function updatePartner(partner: Partner): Promise<boolean> {
  // 1. Update in Supabase (only if record has a real UUID)
  if (isValidUUID(partner.id)) {
    try {
      const supabase = await createClient();
      const updatePayload: Record<string, unknown> = {
        name: partner.name,
        role: partner.role,
        level: partner.level,
        logo: partner.logo,
        description: partner.description,
        email: partner.email,
        phone: partner.phone,
        instagram: partner.instagram,
        linkedin: partner.linkedin,
      };
      if (partner.display_order !== undefined) {
        updatePayload.display_order = partner.display_order;
      }

      const { error } = await supabase
        .from("partners")
        .update(updatePayload)
        .eq("id", partner.id);

      if (error) {
        console.warn("[partners-service] Supabase update error:", error);
        if (partner.display_order !== undefined) {
          delete updatePayload.display_order;
          await supabase.from("partners").update(updatePayload).eq("id", partner.id);
        }
      }
    } catch (err) {
      console.warn("[partners-service] Supabase update connection error:", err);
    }
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal().map((p) => (p.id === partner.id ? partner : p));
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[partners-service] Local file update error:", err);
    return false;
  }
}

export async function reorderPartners(orderedIds: string[]): Promise<boolean> {
  try {
    const current = readLocal();
    const idToPartner = new Map(current.map((p) => [p.id, p]));
    const updated: Partner[] = [];

    orderedIds.forEach((id, idx) => {
      const p = idToPartner.get(id);
      if (p) {
        updated.push({ ...p, display_order: idx + 1 });
        idToPartner.delete(id);
      }
    });

    // Any unlisted partner appended to the end
    let nextOrder = updated.length + 1;
    idToPartner.forEach((p) => {
      updated.push({ ...p, display_order: nextOrder++ });
    });

    await saveLocal(updated);

    // Sync to Supabase
    try {
      const supabase = await createClient();
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (isValidUUID(id)) {
          await supabase
            .from("partners")
            .update({ display_order: i + 1 })
            .eq("id", id);
        }
      }
    } catch (err) {
      console.warn("[partners-service] Supabase reorder sync error:", err);
    }

    return true;
  } catch (err) {
    console.error("[partners-service] reorderPartners error:", err);
    return false;
  }
}

export async function deletePartner(id: string): Promise<boolean> {
  // 1. Delete from Supabase (only if record has a real UUID)
  if (isValidUUID(id)) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("partners").delete().eq("id", id);

      if (error) {
        console.warn("[partners-service] Supabase delete error:", error);
      }
    } catch (err) {
      console.warn("[partners-service] Supabase delete connection error:", err);
    }
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal().filter((p) => p.id !== id);
    await saveLocal(current);
    return true;
  } catch (err) {
    console.error("[partners-service] Local file delete error:", err);
    return false;
  }
}
