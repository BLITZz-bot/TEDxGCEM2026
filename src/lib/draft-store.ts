// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Resilient registration draft store with Supabase write-through and memory fallback.

import { createClient } from "@/lib/supabase/server";

export interface RegistrationDraftRecord {
  id: string;
  user_id?: string;
  auth_handoff_token?: string;
  auth_token_expires_at?: string;
  full_name: string;
  email: string;
  buyer_email?: string;
  phone: string;
  organization: string;
  designation?: string;
  linkedin?: string;
  referral?: string;
  tier_id: string;
  tier_name: string;
  quantity: number;
  amount: number;
  coupon_code?: string | null;
  discount_amount?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attendees_json?: any[];
  status: "pending" | "confirmed" | "expired";
  created_at: string;
  expires_at: string;
}

// In-memory fallback map (handles local dev or before SQL migration is executed in Supabase)
const memoryDraftMap = new Map<string, RegistrationDraftRecord>();

export async function saveDraft(draft: RegistrationDraftRecord): Promise<void> {
  // 1. Always keep in local memory
  memoryDraftMap.set(draft.id, draft);

  // 2. Attempt write to Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("registration_drafts").upsert(draft);
    if (error) {
      console.warn(
        `[draft-store] Supabase registration_drafts write skipped (${error.message}). Using resilient in-memory store.`
      );
    }
  } catch (err) {
    console.warn("[draft-store] Supabase connection error, using in-memory draft fallback:", err);
  }
}

export async function getDraft(draftId: string): Promise<RegistrationDraftRecord | null> {
  // 1. Try Supabase first
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("registration_drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (!error && data) {
      return data as RegistrationDraftRecord;
    }
  } catch {
    // fallback to memory
  }

  // 2. Memory fallback
  return memoryDraftMap.get(draftId) || null;
}

export async function updateDraftStatus(
  draftId: string,
  status: "pending" | "confirmed" | "expired"
): Promise<void> {
  const existing = memoryDraftMap.get(draftId);
  if (existing) {
    existing.status = status;
    memoryDraftMap.set(draftId, existing);
  }

  try {
    const supabase = await createClient();
    await supabase
      .from("registration_drafts")
      .update({ status })
      .eq("id", draftId);
  } catch {
    // silent catch for memory fallback
  }
}
