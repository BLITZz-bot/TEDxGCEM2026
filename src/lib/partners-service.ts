import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface Partner {
  id: string;
  created_at?: string;
  name: string;
  role: string;
  level: string; // "Platinum", "Gold", "Silver", etc.
  logo: string; // Holds base64 data string or URL path
  description: string;
  email?: string;
  phone?: string;
}

const PARTNERS_FILE_PATH = path.join(process.cwd(), "src", "lib", "partners.json");

// Default/Seed Partners
const DEFAULT_PARTNERS: Partner[] = [];

export async function getPartners(): Promise<Partner[]> {
  // 1. Try from Supabase
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
    console.warn("Supabase partners fetch error, falling back to local file:", err);
  }

  // 2. Try local file
  try {
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      const fileData = fs.readFileSync(PARTNERS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Local partners file read error, returning defaults:", err);
  }

  return DEFAULT_PARTNERS;
}

export async function savePartnersLocalFallback(partners: Partner[]): Promise<void> {
  try {
    fs.writeFileSync(PARTNERS_FILE_PATH, JSON.stringify(partners, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local partners JSON fallback:", err);
  }
}

export async function addPartner(partner: Omit<Partner, "id">): Promise<boolean> {
  let supabaseSaved = false;
  let newId = Math.random().toString(36).substring(2, 9); // Fallback ID

  // 1. Save to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partners")
      .insert([partner])
      .select();

    if (!error && data && data.length > 0) {
      supabaseSaved = true;
      newId = data[0].id;
    } else {
      console.warn("Supabase add partner error:", error);
    }
  } catch (err) {
    console.warn("Supabase add partner connection error:", err);
  }

  // 2. Read existing local list, append new partner, and save
  try {
    let currentPartners: Partner[] = [];
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      currentPartners = JSON.parse(fs.readFileSync(PARTNERS_FILE_PATH, "utf-8"));
    } else {
      currentPartners = [...DEFAULT_PARTNERS];
    }
    const newPartner: Partner = {
      id: newId,
      ...partner
    };
    currentPartners.push(newPartner);
    await savePartnersLocalFallback(currentPartners);
    return true;
  } catch (err) {
    console.error("Local partners file append error:", err);
    return supabaseSaved;
  }
}

export async function updatePartner(partner: Partner): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Save to Supabase (only if ID is a valid UUID or existing record)
  try {
    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partner.id);
    if (isUUID) {
      const { error } = await supabase
        .from("partners")
        .update({
          name: partner.name,
          role: partner.role,
          level: partner.level,
          logo: partner.logo,
          description: partner.description,
          email: partner.email,
          phone: partner.phone
        })
        .eq("id", partner.id);

      if (!error) {
        supabaseSaved = true;
      } else {
        console.warn("Supabase update partner error:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase update partner connection error:", err);
  }

  // 2. Update local file
  try {
    let currentPartners: Partner[] = [];
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      currentPartners = JSON.parse(fs.readFileSync(PARTNERS_FILE_PATH, "utf-8"));
    } else {
      currentPartners = [...DEFAULT_PARTNERS];
    }
    currentPartners = currentPartners.map(p => p.id === partner.id ? partner : p);
    await savePartnersLocalFallback(currentPartners);
    return true;
  } catch (err) {
    console.error("Local partners file update error:", err);
    return supabaseSaved;
  }
}

export async function deletePartner(id: string): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Delete from Supabase (only if ID is a valid UUID)
  try {
    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", id);

      if (!error) {
        supabaseSaved = true;
      } else {
        console.warn("Supabase delete partner error:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase delete partner connection error:", err);
  }

  // 2. Update local file
  try {
    let currentPartners: Partner[] = [];
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      currentPartners = JSON.parse(fs.readFileSync(PARTNERS_FILE_PATH, "utf-8"));
    } else {
      currentPartners = [...DEFAULT_PARTNERS];
    }
    currentPartners = currentPartners.filter(p => p.id !== id);
    await savePartnersLocalFallback(currentPartners);
    return true;
  } catch (err) {
    console.error("Local partners file delete error:", err);
    return supabaseSaved;
  }
}
