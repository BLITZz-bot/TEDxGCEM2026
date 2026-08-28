// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";
import { isValidUUID } from "@/lib/db/uuid-validator";

// â”€â”€â”€ Domain type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PARTNERS_FILE_PATH = path.join(process.cwd(), "data", "partners.json");
const DEFAULT_PARTNERS: Partner[] = [];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function readLocal(): Partner[] {
  return readLocalStore<Partner>(PARTNERS_FILE_PATH, DEFAULT_PARTNERS);
}

async function saveLocal(partners: Partner[]): Promise<void> {
  saveLocalStore<Partner>(PARTNERS_FILE_PATH, partners);
}

// â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getPartners(): Promise<Partner[]> {
  // 1. Try Supabase first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("[partners-service] Supabase fetch error, falling back to local file:", err);
  }

  // 2. Fallback to local file
  return readLocal();
}

/** @internal — write-through to local JSON after every mutation */
export async function savePartnersLocalFallback(partners: Partner[]): Promise<void> {
  await saveLocal(partners);
}

export async function addPartner(partner: Omit<Partner, "id">): Promise<boolean> {
  let newId = Math.random().toString(36).substring(2, 9);

  // 1. Persist to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("partners").insert([partner]).select();

    if (!error && data && data.length > 0) {
      newId = data[0].id;
    } else {
      console.warn("[partners-service] Supabase insert error:", error);
    }
  } catch (err) {
    console.warn("[partners-service] Supabase insert connection error:", err);
  }

  // 2. Write-through to local fallback
  try {
    const current = readLocal();
    current.push({ id: newId, ...partner });
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
      const { error } = await supabase
        .from("partners")
        .update({
          name: partner.name,
          role: partner.role,
          level: partner.level,
          logo: partner.logo,
          description: partner.description,
          email: partner.email,
          phone: partner.phone,
        })
        .eq("id", partner.id);

      if (error) {
        console.warn("[partners-service] Supabase update error:", error);
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
