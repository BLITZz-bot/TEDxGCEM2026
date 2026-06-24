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
const DEFAULT_PARTNERS: Partner[] = [
  {
    id: "1",
    name: "Global Tech Corp",
    role: "Hydration Partner",
    level: "Platinum",
    logo: "/GRAFIK1.png",
    description: "Global Tech Corp is a leading multinational technology firm specializing in enterprise software development, cloud infrastructure, and digital transformation services.",
    email: "sponsor@globaltech.corp",
    phone: "+91 98765 43210"
  },
  {
    id: "2",
    name: "Future Systems",
    role: "Technology Partner",
    level: "Platinum",
    logo: "/GRAFIK1.png",
    description: "Future Systems is at the forefront of cyber-physical engineering, delivering automation, robotics, and smart city infrastructure solutions worldwide.",
    email: "info@futuresystems.net",
    phone: "+91 87654 32109"
  },
  {
    id: "3",
    name: "Innovate AI",
    role: "AI Partner",
    level: "Gold",
    logo: "/GRAFIK1.png",
    description: "Innovate AI leverages state-of-the-art machine learning models to provide automated business analytics, predictive modeling, and intelligent agent systems.",
    email: "partnership@innovate.ai",
    phone: "+91 76543 21098"
  },
  {
    id: "4",
    name: "Eco Solutions",
    role: "Sustainability Partner",
    level: "Gold",
    logo: "/GRAFIK1.png",
    description: "Eco Solutions develops sustainable technologies, green energy grids, and resource management software to help enterprises lower their carbon footprints.",
    email: "hello@ecosolutions.org",
    phone: "+91 65432 10987"
  },
  {
    id: "5",
    name: "Creative Media",
    role: "Media Partner",
    level: "Silver",
    logo: "/GRAFIK1.png",
    description: "Creative Media is an award-winning digital design agency crafting immersive web experiences, brand identities, and high-impact marketing campaigns.",
    email: "design@creativemedia.com",
    phone: "+91 54321 09876"
  },
  {
    id: "6",
    name: "Urban Planning Co",
    role: "Venue Partner",
    level: "Silver",
    logo: "/GRAFIK1.png",
    description: "Urban Planning Co designs smart architectural spaces and coordinates eco-friendly community infrastructure projects for futuristic municipalities.",
    email: "build@urbanplanning.co",
    phone: "+91 43210 98765"
  },
  {
    id: "7",
    name: "NextGen Education",
    role: "Education Partner",
    level: "Silver",
    logo: "/GRAFIK1.png",
    description: "NextGen Education provides online learning platforms, interactive academic curricula, and AI-driven tutoring tools to schools across the globe.",
    email: "edu@nextgen.org",
    phone: "+91 32109 87654"
  },
  {
    id: "8",
    name: "Digital Arts",
    role: "Creative Partner",
    level: "Silver",
    logo: "/GRAFIK1.png",
    description: "Digital Arts is a creative collaborative providing digital illustration, visual effects, and high-fidelity rendering software to creators.",
    email: "art@digitalarts.io",
    phone: "+91 21098 76543"
  }
];

export async function getPartners(): Promise<Partner[]> {
  // 1. Try from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase partners fetch error, falling back to local file:", err);
  }

  // 2. Try local file
  try {
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      const fileData = fs.readFileSync(PARTNERS_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
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
    let currentPartners = DEFAULT_PARTNERS;
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      currentPartners = JSON.parse(fs.readFileSync(PARTNERS_FILE_PATH, "utf-8"));
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

  // 1. Save to Supabase
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
        phone: partner.phone
      })
      .eq("id", partner.id);

    if (!error) {
      supabaseSaved = true;
    } else {
      console.warn("Supabase update partner error:", error);
    }
  } catch (err) {
    console.warn("Supabase update partner connection error:", err);
  }

  // 2. Update local file
  try {
    let currentPartners = DEFAULT_PARTNERS;
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      currentPartners = JSON.parse(fs.readFileSync(PARTNERS_FILE_PATH, "utf-8"));
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

  // 1. Delete from Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("partners")
      .delete()
      .eq("id", id);

    if (!error) {
      supabaseSaved = true;
    } else {
      console.warn("Supabase delete partner error:", error);
    }
  } catch (err) {
    console.warn("Supabase delete partner connection error:", err);
  }

  // 2. Update local file
  try {
    let currentPartners = DEFAULT_PARTNERS;
    if (fs.existsSync(PARTNERS_FILE_PATH)) {
      currentPartners = JSON.parse(fs.readFileSync(PARTNERS_FILE_PATH, "utf-8"));
    }
    currentPartners = currentPartners.filter(p => p.id !== id);
    await savePartnersLocalFallback(currentPartners);
    return true;
  } catch (err) {
    console.error("Local partners file delete error:", err);
    return supabaseSaved;
  }
}
