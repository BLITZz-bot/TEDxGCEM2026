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
  download_count?: number;
  downloaded_at?: string | null;
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

export async function findComplimentaryPassesByEmail(email: string): Promise<ComplimentaryPass[]> {
  const normEmail = email.trim().toLowerCase();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("complimentary_passes")
      .select("*")
      .ilike("email", normEmail)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase lookup error:", err);
  }

  const local = readLocal();
  return local.filter((p) => p.email.toLowerCase() === normEmail);
}

export async function findComplimentaryPassByEmail(email: string): Promise<ComplimentaryPass | null> {
  const passes = await findComplimentaryPassesByEmail(email);
  return passes[0] || null;
}

export async function recordComplimentaryPassDownload(
  identifier: string,
  userEmail?: string
): Promise<{ success: boolean; count: number }> {
  const now = new Date().toISOString();
  const trimmedId = identifier.trim();
  const normEmail = (userEmail || "").trim().toLowerCase();

  try {
    const supabase = await createClient();

    let query = supabase.from("complimentary_passes").select("id, pass_code, email, download_count");
    if (trimmedId.startsWith("TEDX-GUEST-")) {
      query = query.eq("pass_code", trimmedId);
    } else if (normEmail) {
      query = query.ilike("email", normEmail);
    } else {
      query = query.or(`pass_code.eq.${trimmedId},id.eq.${trimmedId}`);
    }

    const { data, error } = await query.limit(1);

    if (!error && Array.isArray(data) && data.length > 0) {
      const pass = data[0];
      const newCount = (Number(pass.download_count) || 0) + 1;

      const { error: updateError } = await supabase
        .from("complimentary_passes")
        .update({
          download_count: newCount,
          downloaded_at: now,
          updated_at: now,
        })
        .eq("id", pass.id);

      if (!updateError) {
        const all = await getComplimentaryPasses();
        await saveLocal(all);
        return { success: true, count: newCount };
      }
    }
  } catch (err) {
    console.warn("[complimentary-service] Supabase download tracking error, updating local store:", err);
  }

  const local = readLocal();
  const idx = local.findIndex(
    (p) =>
      p.pass_code === trimmedId ||
      p.id === trimmedId ||
      (normEmail && p.email.toLowerCase() === normEmail)
  );

  if (idx !== -1) {
    const newCount = (local[idx].download_count || 0) + 1;
    local[idx] = {
      ...local[idx],
      download_count: newCount,
      downloaded_at: now,
      updated_at: now,
    };
    await saveLocal(local);
    return { success: true, count: newCount };
  }

  return { success: false, count: 0 };
}

