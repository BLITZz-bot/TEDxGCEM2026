import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface TicketTier {
  id: string;
  name: string;
  tag: string;
  description: string;
  price: number;
  total_capacity: number;
  sold_count?: number;
  allow_coupons: boolean;
  discount_price: number | null; // Price when coupon is applied
  status: "active" | "closed" | "sold_out" | "upcoming";
  sort_order: number;
  manual_override?: boolean; // If admin manually set this tier active/closed
}

export const DEFAULT_TICKET_TIERS: TicketTier[] = [
  {
    id: "early_bird",
    name: "Early Bird",
    tag: "Priority Pass",
    description: "Exclusive early bird access pass with curated kit and all speaker sessions.",
    price: 300,
    total_capacity: 20,
    allow_coupons: false,
    discount_price: null,
    status: "active",
    sort_order: 1,
  },
  {
    id: "phase_1",
    name: "Phase 1",
    tag: "Phase 1 Pass",
    description: "Official Phase 1 delegate pass including keynote talks, delegate kit, and networking.",
    price: 400,
    total_capacity: 35,
    allow_coupons: true,
    discount_price: 300, // Reverts to Early Bird price with coupon
    status: "upcoming",
    sort_order: 2,
  },
  {
    id: "phase_2",
    name: "Phase 2",
    tag: "Phase 2 Pass",
    description: "Phase 2 standard admission with access to all speaker presentations and event goodies.",
    price: 500,
    total_capacity: 35,
    allow_coupons: true,
    discount_price: 400, // Reverts to Phase 1 price with coupon
    status: "upcoming",
    sort_order: 3,
  },
  {
    id: "phase_3",
    name: "Phase 3",
    tag: "Final Release",
    description: "Final release general delegate pass with elite networking opportunities.",
    price: 1000,
    total_capacity: 10,
    allow_coupons: true,
    discount_price: 500, // Reverts to Phase 2 price with coupon
    status: "upcoming",
    sort_order: 4,
  },
];

const TICKETS_FILE_PATH = path.join(process.cwd(), "src", "lib", "tickets.json");

// Helper to read local json
function readLocalTiers(): TicketTier[] {
  try {
    if (fs.existsSync(TICKETS_FILE_PATH)) {
      const data = fs.readFileSync(TICKETS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Local tickets.json read error:", err);
  }
  return DEFAULT_TICKET_TIERS;
}

// Helper to save local json
function saveLocalTiers(tiers: TicketTier[]) {
  try {
    fs.writeFileSync(TICKETS_FILE_PATH, JSON.stringify(tiers, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local tickets.json write error:", err);
  }
}

/**
 * Computes sold counts per tier from the registrations table
 */
export async function getTierSoldCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {
    early_bird: 0,
    phase_1: 0,
    phase_2: 0,
    phase_3: 0,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("registrations")
      .select("id, tier_id, ticket_status, razorpay_payment_id, payment_id");

    if (!error && data) {
      data.forEach((reg: { tier_id?: string; ticket_status?: string; razorpay_payment_id?: string; payment_id?: string }) => {
        const isPaid =
          reg.ticket_status === "confirmed" ||
          reg.ticket_status === "approved" ||
          !!reg.razorpay_payment_id ||
          !!reg.payment_id;

        if (isPaid) {
          const tierKey = reg.tier_id || "early_bird";
          if (counts[tierKey] !== undefined) {
            counts[tierKey] += 1;
          } else {
            counts.early_bird += 1;
          }
        }
      });
    }
  } catch (err) {
    console.warn("Error calculating tier sold counts:", err);
  }

  return counts;
}

/**
 * Returns all ticket tiers with dynamic status and live sold counts
 */
export async function getAllTicketTiers(): Promise<TicketTier[]> {
  let tiers = readLocalTiers();

  // Try fetching from Supabase if table exists
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticket_tiers")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      tiers = data;
    }
  } catch {
    // fallback to local tiers
  }

  // Sort tiers by sort_order
  tiers.sort((a, b) => a.sort_order - b.sort_order);

  // Get live sold counts
  const soldCounts = await getTierSoldCounts();

  // Check if admin explicitly set any tier to "active" or "closed"
  const manualActiveTier = tiers.find((t) => t.status === "active");
  const manualClosedTier = tiers.find((t) => t.status === "closed");

  // Determine the progression tier
  // If an active tier exists, verify if it is full
  // If no manual override, find the first tier whose sold_count < total_capacity
  let currentProgressionIndex = -1;

  if (manualActiveTier) {
    const activeIdx = tiers.findIndex((t) => t.id === manualActiveTier.id);
    const sold = soldCounts[manualActiveTier.id] || 0;
    if (sold >= manualActiveTier.total_capacity) {
      // It reached full capacity! Automatically advance to next tier
      currentProgressionIndex = activeIdx + 1;
    } else {
      currentProgressionIndex = activeIdx;
    }
  } else if (manualClosedTier) {
    // Admin explicitly closed a tier. That tier remains closed, and next tier DOES NOT OPEN!
    const closedIdx = tiers.findIndex((t) => t.id === manualClosedTier.id);
    currentProgressionIndex = closedIdx;
  } else {
    // Normal auto progression from the beginning: find first non-full tier
    currentProgressionIndex = tiers.findIndex((t) => (soldCounts[t.id] || 0) < t.total_capacity);
    if (currentProgressionIndex === -1) {
      currentProgressionIndex = tiers.length - 1; // All sold out
    }
  }

  const updatedTiers = tiers.map((tier, idx) => {
    const sold = soldCounts[tier.id] || 0;
    const isFull = sold >= tier.total_capacity;

    let computedStatus: "active" | "closed" | "sold_out" | "upcoming" = "upcoming";

    if (isFull) {
      computedStatus = "sold_out";
    } else if (idx < currentProgressionIndex) {
      // Prior tiers that reached capacity
      computedStatus = "sold_out";
    } else if (idx === currentProgressionIndex) {
      if (tier.status === "closed") {
        computedStatus = "closed";
      } else {
        computedStatus = "active";
      }
    } else {
      // idx > currentProgressionIndex: subsequent tiers stay upcoming
      computedStatus = "upcoming";
    }

    return {
      ...tier,
      sold_count: sold,
      status: computedStatus,
    };
  });

  return updatedTiers;
}

/**
 * Returns the currently active ticket tier
 */
export async function getActiveTicketTier(): Promise<TicketTier> {
  const tiers = await getAllTicketTiers();
  
  // 1. If an active tier exists, return it
  const active = tiers.find((t) => t.status === "active");
  if (active) return active;

  // 2. If a tier is manually closed, return it so the frontend knows it's closed and does NOT skip to the next tier!
  const closed = tiers.find((t) => t.status === "closed");
  if (closed) return closed;

  // 3. Fallback: first tier
  return tiers[0] || DEFAULT_TICKET_TIERS[0];
}

/**
 * Update a tier's status or manual override (Admin only)
 */
export async function updateTierStatus(tierId: string, status: "active" | "closed" | "upcoming", manualOverride = true): Promise<boolean> {
  const tiers = readLocalTiers();
  const index = tiers.findIndex((t) => t.id === tierId);
  if (index === -1) return false;

  if (status === "active") {
    // Set selected tier to active, and other non-sold-out tiers to upcoming
    tiers.forEach((t) => {
      if (t.id === tierId) {
        t.status = "active";
        t.manual_override = manualOverride;
      } else {
        t.status = "upcoming";
        t.manual_override = false;
      }
    });
  } else if (status === "closed") {
    // Mark this tier closed, and ensure other tiers STAY upcoming (do not open next tier)
    tiers.forEach((t) => {
      if (t.id === tierId) {
        t.status = "closed";
        t.manual_override = manualOverride;
      } else {
        t.status = "upcoming";
        t.manual_override = false;
      }
    });
  } else {
    tiers[index].status = status;
    tiers[index].manual_override = manualOverride;
  }

  saveLocalTiers(tiers);

  try {
    const supabase = await createClient();
    for (const t of tiers) {
      await supabase
        .from("ticket_tiers")
        .upsert({
          id: t.id,
          name: t.name,
          tag: t.tag,
          description: t.description,
          price: t.price,
          total_capacity: t.total_capacity,
          allow_coupons: t.allow_coupons,
          discount_price: t.discount_price,
          status: t.status,
          sort_order: t.sort_order,
          manual_override: t.manual_override,
          updated_at: new Date().toISOString(),
        });
    }
  } catch (err) {
    console.warn("Supabase ticket_tiers update error:", err);
  }

  return true;
}

/**
 * Update a tier's total capacity (Admin only)
 */
export async function updateTierCapacity(tierId: string, newCapacity: number): Promise<boolean> {
  if (newCapacity < 1) return false;

  const tiers = await getAllTicketTiers();
  const index = tiers.findIndex((t) => t.id === tierId);
  if (index === -1) return false;

  tiers[index].total_capacity = newCapacity;
  saveLocalTiers(tiers);

  try {
    const supabase = await createClient();
    await supabase
      .from("ticket_tiers")
      .update({ total_capacity: newCapacity, updated_at: new Date().toISOString() })
      .eq("id", tierId);
  } catch (err) {
    console.warn("Supabase ticket_tiers capacity update error:", err);
  }

  return true;
}
