import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface PromoCoupon {
  id: string;
  code: string;
  discount_amount: number; // e.g. 100 (or custom discount)
  applies_to_tier?: string | null; // e.g. "phase_1", "all", etc.
  created_at: string;
  expires_at: string; // created_at + 10 minutes (or custom duration)
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

const COUPONS_FILE_PATH = path.join(process.cwd(), "src", "lib", "coupons.json");

// Helper to read local json
function readLocalCoupons(): PromoCoupon[] {
  try {
    if (fs.existsSync(COUPONS_FILE_PATH)) {
      const data = fs.readFileSync(COUPONS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Local coupons.json read error:", err);
  }
  return [];
}

// Helper to save local json
function saveLocalCoupons(coupons: PromoCoupon[]) {
  try {
    fs.writeFileSync(COUPONS_FILE_PATH, JSON.stringify(coupons, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local coupons.json write error:", err);
  }
}

/**
 * Generate a high-entropy random promo code (e.g., TEDX-7K9Q2)
 */
export function generateRandomCouponCode(prefix = "TEDX"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}

/**
 * Create a new coupon (Default: 10 minutes expiry)
 */
export async function createCoupon(
  code: string,
  discountAmount = 100,
  durationMinutes = 10,
  tierRestriction?: string | null
): Promise<PromoCoupon> {
  const cleanCode = code.trim().toUpperCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const newCoupon: PromoCoupon = {
    id: `cpn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code: cleanCode,
    discount_amount: discountAmount,
    applies_to_tier: tierRestriction || null,
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

  const localCoupons = readLocalCoupons();
  // Replace if exists, or append
  const filtered = localCoupons.filter((c) => c.code !== cleanCode);
  filtered.unshift(newCoupon);
  saveLocalCoupons(filtered);

  try {
    const supabase = await createClient();
    await supabase.from("coupons").upsert(newCoupon);
  } catch (err) {
    console.warn("Supabase coupon creation error:", err);
  }

  return newCoupon;
}

/**
 * Get all coupons (Active, Expired, and Redeemed)
 */
export async function getAllCoupons(): Promise<PromoCoupon[]> {
  let coupons = readLocalCoupons();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      coupons = data;
    }
  } catch {
    // fallback to local
  }

  return coupons;
}

/**
 * Validate a coupon code server-side
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
  if (!code || !code.trim()) {
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

  const now = new Date().getTime();
  const expiresAt = new Date(coupon.expires_at).getTime();

  if (now > expiresAt) {
    return {
      valid: false,
      error: "This promo code has expired. Promo codes are valid for 10 minutes from generation.",
    };
  }

  // Calculate discount based on active tier rules
  // If active tier has a specific discount_price (e.g. Phase 1 @ 400 with discount 300 = ₹100 discount)
  let calculatedDiscount = coupon.discount_amount;
  let finalPrice = Math.max(0, activeTierPrice - calculatedDiscount);

  if (discountedPrice !== null && discountedPrice !== undefined) {
    calculatedDiscount = activeTierPrice - discountedPrice;
    finalPrice = discountedPrice;
  }

  return {
    valid: true,
    coupon,
    discountAmount: calculatedDiscount,
    finalAmount: finalPrice,
  };
}

/**
 * Mark a coupon as redeemed after successful payment
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
  const coupons = readLocalCoupons();
  const index = coupons.findIndex((c) => c.code === cleanCode);

  const now = new Date().toISOString();
  if (index !== -1) {
    coupons[index].is_used = true;
    coupons[index].used_by_email = details.email;
    coupons[index].used_by_name = details.fullName;
    coupons[index].used_by_phone = details.phone || null;
    coupons[index].used_by_org = details.organization || null;
    coupons[index].used_at = now;
    coupons[index].registration_id = details.registrationId || null;
    coupons[index].tier_id = details.tierId || null;
    coupons[index].amount_paid = details.amountPaid || null;
    saveLocalCoupons(coupons);
  }

  try {
    const supabase = await createClient();
    await supabase
      .from("coupons")
      .update({
        is_used: true,
        used_by_email: details.email,
        used_by_name: details.fullName,
        used_by_phone: details.phone || null,
        used_by_org: details.organization || null,
        used_at: now,
        registration_id: details.registrationId || null,
        tier_id: details.tierId || null,
        amount_paid: details.amountPaid || null,
      })
      .eq("code", cleanCode);
  } catch (err) {
    console.warn("Supabase coupon redemption error:", err);
  }

  return true;
}

/**
 * Delete / Revoke a coupon (Admin only)
 */
export async function deleteCoupon(couponId: string): Promise<boolean> {
  const coupons = readLocalCoupons().filter((c) => c.id !== couponId && c.code !== couponId);
  saveLocalCoupons(coupons);

  try {
    const supabase = await createClient();
    await supabase.from("coupons").delete().or(`id.eq.${couponId},code.eq.${couponId}`);
  } catch (err) {
    console.warn("Supabase coupon delete error:", err);
  }

  return true;
}
