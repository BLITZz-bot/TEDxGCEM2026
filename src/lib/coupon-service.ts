// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
import path from "path";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { readLocalStore, saveLocalStore } from "@/lib/db/local-store";

// â”€â”€â”€ Domain type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PromoCoupon {
  id: string;
  code: string;
  /** Discount amount in INR (e.g. 100) */
  discount_amount: number;
  /** Tier restriction: "phase_1", "all", or null for any tier */
  applies_to_tier?: string | null;
  created_at: string;
  /** ISO timestamp — defaults to created_at + 10 minutes */
  expires_at: string;
  is_used: boolean;
  used_by_email?: string | null;
  used_by_name?: string | null;
  used_by_phone?: string | null;
  used_by_org?: string | null;
  used_at?: string | null;
  registration_id?: string | null;
  tier_id?: string | null;
  amount_paid?: number | null;
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COUPONS_FILE_PATH = path.join(process.cwd(), "data", "coupons.json");

/** High-entropy alphabet (ambiguous characters I/O/0/1 removed) */
const COUPON_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Default coupon expiry in minutes */
const DEFAULT_EXPIRY_MINUTES = 10;

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function readLocal(): PromoCoupon[] {
  return readLocalStore<PromoCoupon>(COUPONS_FILE_PATH, []);
}

function saveLocal(coupons: PromoCoupon[]): void {
  saveLocalStore<PromoCoupon>(COUPONS_FILE_PATH, coupons);
}

// â”€â”€â”€ Public API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Generate a high-entropy random promo code (e.g. `TEDX-7K9Q2`).
 * Uses a carefully chosen alphabet that avoids visually ambiguous characters.
 */
/**
 * Generates a high-entropy random promo code using crypto.randomInt() — NOT Math.random().
 * Math.random() is predictable and could allow an attacker to guess future codes.
 */
export function generateRandomCouponCode(prefix = "TEDX"): string {
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += COUPON_ALPHABET.charAt(crypto.randomInt(0, COUPON_ALPHABET.length));
  }
  return `${prefix}-${randomPart}`;
}

/**
 * Create a new promo coupon.
 *
 * @param code             - Coupon code string (will be uppercased & trimmed)
 * @param discountAmount   - Amount to deduct in INR (default: 100)
 * @param durationMinutes  - Validity window in minutes (default: 10)
 * @param tierRestriction  - Limit coupon to a specific tier ID, or null for all tiers
 */
export async function createCoupon(
  code: string,
  discountAmount = 100,
  durationMinutes = DEFAULT_EXPIRY_MINUTES,
  tierRestriction?: string | null
): Promise<PromoCoupon> {
  const cleanCode = code.trim().toUpperCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const newCoupon: PromoCoupon = {
    id: `cpn_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    code: cleanCode,
    discount_amount: discountAmount,
    applies_to_tier: tierRestriction ?? null,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    is_used: false,
    used_by_email: null,
    used_by_name: null,
    used_by_phone: null,
    used_by_org: null,
    used_at: null,
    registration_id: null,
    tier_id: null,
    amount_paid: null,
  };

  // Write-through: replace if code exists, otherwise prepend
  const existing = readLocal();
  const filtered = existing.filter((c) => c.code !== cleanCode);
  filtered.unshift(newCoupon);
  saveLocal(filtered);

  try {
    const supabase = await createClient();
    await supabase.from("coupons").upsert(newCoupon);
  } catch (err) {
    console.warn("[coupon-service] Supabase upsert error:", err);
  }

  return newCoupon;
}

/** Return all coupons (active, expired, and redeemed) */
export async function getAllCoupons(): Promise<PromoCoupon[]> {
  // Optimistically try Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // fallback to local store
  }

  return readLocal();
}

/**
 * Validate a coupon code server-side.
 * Returns a discriminated result object — callers should check `valid` before using other fields.
 */
export async function validateCoupon(
  code: string,
  activeTierId: string,
  activeTierPrice: number,
  discountedPrice: number | null
): Promise<{
  valid: boolean;
  error?: string;
  coupon?: PromoCoupon;
  discountAmount?: number;
  finalAmount?: number;
}> {
  if (!code?.trim()) {
    return { valid: false, error: "Please enter a coupon code." };
  }

  const cleanCode = code.trim().toUpperCase();
  const coupons = await getAllCoupons();
  const coupon = coupons.find((c) => c.code === cleanCode);

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code. Please verify and try again." };
  }

  if (coupon.is_used) {
    return { valid: false, error: "This coupon code has already been redeemed." };
  }

  const now = Date.now();
  const expiresAt = new Date(coupon.expires_at).getTime();

  if (now > expiresAt) {
    return {
      valid: false,
      error: "This promo code has expired. Promo codes are valid for 10 minutes from generation.",
    };
  }

  // Calculate final price based on tier-specific discount rules
  let calculatedDiscount = coupon.discount_amount;
  let finalPrice = Math.max(0, activeTierPrice - calculatedDiscount);

  if (discountedPrice !== null && discountedPrice !== undefined) {
    calculatedDiscount = activeTierPrice - discountedPrice;
    finalPrice = discountedPrice;
  }

  // Suppress unused variable warning — activeTierId is reserved for future tier-restriction logic
  void activeTierId;

  return {
    valid: true,
    coupon,
    discountAmount: calculatedDiscount,
    finalAmount: finalPrice,
  };
}

/**
 * Mark a coupon as redeemed after successful payment.
 * Updates both the local store and Supabase.
 */
export async function redeemCoupon(
  code: string,
  details: {
    email: string;
    fullName: string;
    phone?: string;
    organization?: string;
    registrationId?: string;
    tierId?: string;
    amountPaid?: number;
  }
): Promise<boolean> {
  const cleanCode = code.trim().toUpperCase();
  const now = new Date().toISOString();

  // 1. Update local store
  const coupons = readLocal();
  const index = coupons.findIndex((c) => c.code === cleanCode);
  if (index !== -1) {
    coupons[index] = {
      ...coupons[index],
      is_used: true,
      used_by_email: details.email,
      used_by_name: details.fullName,
      used_by_phone: details.phone ?? null,
      used_by_org: details.organization ?? null,
      used_at: now,
      registration_id: details.registrationId ?? null,
      tier_id: details.tierId ?? null,
      amount_paid: details.amountPaid ?? null,
    };
    saveLocal(coupons);
  }

  // 2. Update Supabase
  try {
    const supabase = await createClient();
    await supabase
      .from("coupons")
      .update({
        is_used: true,
        used_by_email: details.email,
        used_by_name: details.fullName,
        used_by_phone: details.phone ?? null,
        used_by_org: details.organization ?? null,
        used_at: now,
        registration_id: details.registrationId ?? null,
        tier_id: details.tierId ?? null,
        amount_paid: details.amountPaid ?? null,
      })
      .eq("code", cleanCode);
  } catch (err) {
    console.warn("[coupon-service] Supabase redemption error:", err);
  }

  return true;
}

/**
 * Delete / revoke a coupon (admin only).
 * Accepts either the coupon `id` or the `code` string.
 */
export async function deleteCoupon(couponId: string): Promise<boolean> {
  const updated = readLocal().filter((c) => c.id !== couponId && c.code !== couponId);
  saveLocal(updated);

  try {
    const supabase = await createClient();
    await supabase.from("coupons").delete().or(`id.eq.${couponId},code.eq.${couponId}`);
  } catch (err) {
    console.warn("[coupon-service] Supabase delete error:", err);
  }

  return true;
}
