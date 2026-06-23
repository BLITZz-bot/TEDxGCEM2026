import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface TeamMember {
  id: string;
  created_at?: string;
  name: string;
  role: string;
  image_url: string; // holds base64 data string
  email?: string;
  linkedin?: string;
  bio: string;
}

const TEAM_FILE_PATH = path.join(process.cwd(), "src", "lib", "team.json");

// Default/Seed Team Members
const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    role: "Licensee & Organizer",
    image_url: "",
    email: "aarav.sharma@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/aarav-sharma",
    bio: "Passionate about building community platforms and showcasing local talent. Aarav oversees the overall execution and direction of TEDxGCEM."
  },
  {
    id: "2",
    name: "Diya Iyer",
    role: "Co-Organizer",
    image_url: "",
    email: "diya.iyer@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/diya-iyer",
    bio: "Coordinating operations and sponsorships, Diya bridges the gap between creative vision and administrative excellence."
  },
  {
    id: "3",
    name: "Rohan Verma",
    role: "Curation Lead",
    image_url: "",
    email: "rohan.verma@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/rohan-verma",
    bio: "Dedicated to seeking out stories that matter, Rohan works closely with our speakers to refine their ideas for the stage."
  },
  {
    id: "4",
    name: "Kavya Menon",
    role: "Design & Tech Lead",
    image_url: "",
    email: "kavya.menon@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/kavya-menon",
    bio: "Leading the development of the website and branding, Kavya blends tech and design to establish our digital footprint."
  },
  {
    id: "5",
    name: "Vikram Sen",
    role: "Marketing & PR Lead",
    image_url: "",
    email: "vikram.sen@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/vikram-sen",
    bio: "Spreading the word across all media, Vikram designs campaigns that engage the public and build excitement."
  },
  {
    id: "6",
    name: "Ananya Rao",
    role: "Operations & Production Lead",
    image_url: "",
    email: "ananya.rao@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/ananya-rao",
    bio: "Ananya keeps the gear turning behind the scenes, managing event logistics, schedules, and live stage production."
  },
  {
    id: "7",
    name: "Siddharth Nair",
    role: "Sponsorship & Finance Lead",
    image_url: "",
    email: "siddharth.nair@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/siddharth-nair",
    bio: "Handling financial partnerships and budget compliance to ensure a sustainable and high-quality conference experience."
  },
  {
    id: "8",
    name: "Meera Patel",
    role: "Volunteer Coordinator",
    image_url: "",
    email: "meera.patel@tedxgcem.com",
    linkedin: "https://www.linkedin.com/in/meera-patel",
    bio: "Meera organizes our team of student volunteers, coordinating on-ground operations to ensure a seamless attendee experience."
  }
];

export async function getTeamMembers(): Promise<TeamMember[]> {
  // 1. Try from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase team_members fetch error, falling back to local file:", err);
  }

  // 2. Try local file
  try {
    if (fs.existsSync(TEAM_FILE_PATH)) {
      const fileData = fs.readFileSync(TEAM_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.warn("Local team file read error, returning defaults:", err);
  }

  return DEFAULT_TEAM;
}

export async function saveTeamLocalFallback(members: TeamMember[]): Promise<void> {
  try {
    fs.writeFileSync(TEAM_FILE_PATH, JSON.stringify(members, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local team JSON fallback:", err);
  }
}

export async function addTeamMember(member: Omit<TeamMember, "id">): Promise<boolean> {
  let supabaseSaved = false;
  let newId = Math.random().toString(36).substring(2, 9); // Fallback ID

  // 1. Save to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .insert([member])
      .select();

    if (!error && data && data.length > 0) {
      supabaseSaved = true;
      newId = data[0].id;
    } else {
      console.warn("Supabase add team member error:", error);
    }
  } catch (err) {
    console.warn("Supabase add team member connection error:", err);
  }

  // 2. Read existing local list, append new member, and save
  try {
    let currentMembers = DEFAULT_TEAM;
    if (fs.existsSync(TEAM_FILE_PATH)) {
      currentMembers = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, "utf-8"));
    }
    const newMember: TeamMember = {
      id: newId,
      ...member
    };
    currentMembers.push(newMember);
    await saveTeamLocalFallback(currentMembers);
    return true;
  } catch (err) {
    console.error("Local team file append error:", err);
    return supabaseSaved;
  }
}

export async function updateTeamMember(member: TeamMember): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Save to Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("team_members")
      .update({
        name: member.name,
        role: member.role,
        image_url: member.image_url,
        email: member.email,
        linkedin: member.linkedin,
        bio: member.bio
      })
      .eq("id", member.id);

    if (!error) {
      supabaseSaved = true;
    } else {
      console.warn("Supabase update team member error:", error);
    }
  } catch (err) {
    console.warn("Supabase update team member connection error:", err);
  }

  // 2. Update local file
  try {
    let currentMembers = DEFAULT_TEAM;
    if (fs.existsSync(TEAM_FILE_PATH)) {
      currentMembers = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, "utf-8"));
    }
    currentMembers = currentMembers.map(m => m.id === member.id ? member : m);
    await saveTeamLocalFallback(currentMembers);
    return true;
  } catch (err) {
    console.error("Local team file update error:", err);
    return supabaseSaved;
  }
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Delete from Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (!error) {
      supabaseSaved = true;
    } else {
      console.warn("Supabase delete team member error:", error);
    }
  } catch (err) {
    console.warn("Supabase delete team member connection error:", err);
  }

  // 2. Update local file
  try {
    let currentMembers = DEFAULT_TEAM;
    if (fs.existsSync(TEAM_FILE_PATH)) {
      currentMembers = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, "utf-8"));
    }
    currentMembers = currentMembers.filter(m => m.id !== id);
    await saveTeamLocalFallback(currentMembers);
    return true;
  } catch (err) {
    console.error("Local team file delete error:", err);
    return supabaseSaved;
  }
}
