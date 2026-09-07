// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.

import path from "path";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";

export interface ComplimentaryPass {
  id: string;
  pass_code: string;
  full_name: string;
  email: string;
  phone: string;
  note: string;
  email_status: "sent" | "failed" | "pending";
  created_at: string;
  updated_at?: string;
}

const COMPLIMENTARY_FILE_PATH = path.join(process.cwd(), "data", "complimentary_passes.json");
const DEFAULT_PASSES: ComplimentaryPass[] = [];

function readLocal(): ComplimentaryPass[] {
  return readLocalStore<ComplimentaryPass>(COMPLIMENTARY_FILE_PATH, DEFAULT_PASSES);
}

async function saveLocal(passes: ComplimentaryPass[]): Promise<void> {
  saveLocalStore<ComplimentaryPass>(COMPLIMENTARY_FILE_PATH, passes);
}

export function generatePassCode(): string {
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `TEDX-GUEST-${rand}`;
}

export async function getComplimentaryPasses(): Promise<ComplimentaryPass[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("complimentary_passes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      await saveLocal(data);
      return data;
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase error, falling back to local file:", err);
  }

  return readLocal();
}

export async function createComplimentaryPass(params: {
  fullName: string;
  email: string;
  phone: string;
  note?: string;
  emailStatus?: "sent" | "failed" | "pending";
}): Promise<ComplimentaryPass> {
  const passCode = generatePassCode();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newPass: ComplimentaryPass = {
    id,
    pass_code: passCode,
    full_name: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    phone: params.phone.trim(),
    note: (params.note || "").trim(),
    email_status: params.emailStatus || "sent",
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("complimentary_passes")
      .insert({
        id: newPass.id,
        pass_code: newPass.pass_code,
        full_name: newPass.full_name,
        email: newPass.email,
        phone: newPass.phone,
        note: newPass.note,
        email_status: newPass.email_status,
        created_at: newPass.created_at,
        updated_at: newPass.updated_at,
      })
      .select()
      .single();

    if (!error && data) {
      const all = await getComplimentaryPasses();
      await saveLocal(all);
      return data;
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase insert failed, saving to local fallback:", err);
  }

  const existing = readLocal();
  const updated = [newPass, ...existing];
  await saveLocal(updated);
  return newPass;
}

export async function updateComplimentaryPass(
  id: string,
  updates: Partial<Pick<ComplimentaryPass, "full_name" | "email" | "phone" | "note" | "email_status">>
): Promise<ComplimentaryPass | null> {
  const now = new Date().toISOString();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("complimentary_passes")
      .update({
        ...updates,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const all = await getComplimentaryPasses();
      await saveLocal(all);
      return data;
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase update failed, updating local fallback:", err);
  }

  const existing = readLocal();
  const index = existing.findIndex((p) => p.id === id);
  if (index === -1) return null;

  existing[index] = {
    ...existing[index],
    ...updates,
    updated_at: now,
  };

  await saveLocal(existing);
  return existing[index];
}

export async function deleteComplimentaryPass(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("complimentary_passes").delete().eq("id", id);
    if (!error) {
      const all = await getComplimentaryPasses();
      await saveLocal(all);
      return true;
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase delete failed, deleting from local store:", err);
  }

  const existing = readLocal();
  const filtered = existing.filter((p) => p.id !== id);
  await saveLocal(filtered);
  return true;
}

export async function findComplimentaryPassByEmail(email: string): Promise<ComplimentaryPass | null> {
  const normEmail = email.trim().toLowerCase();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("complimentary_passes")
      .select("*")
      .ilike("email", normEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase lookup error:", err);
  }

  const local = readLocal();
  return local.find((p) => p.email.toLowerCase() === normEmail) || null;
}
