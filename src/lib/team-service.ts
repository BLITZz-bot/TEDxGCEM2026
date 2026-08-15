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
const DEFAULT_TEAM: TeamMember[] = [];

export async function getTeamMembers(): Promise<TeamMember[]> {
  // 1. Try from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase team_members fetch error, falling back to local file:", err);
  }

  // 2. Try local file
  try {
    if (fs.existsSync(TEAM_FILE_PATH)) {
      const fileData = fs.readFileSync(TEAM_FILE_PATH, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
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
    let currentMembers: TeamMember[] = [];
    if (fs.existsSync(TEAM_FILE_PATH)) {
      currentMembers = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, "utf-8"));
    } else {
      currentMembers = [...DEFAULT_TEAM];
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

  // 1. Save to Supabase (only if ID is a valid UUID)
  try {
    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(member.id);
    if (isUUID) {
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
    }
  } catch (err) {
    console.warn("Supabase update team member connection error:", err);
  }

  // 2. Update local file
  try {
    let currentMembers: TeamMember[] = [];
    if (fs.existsSync(TEAM_FILE_PATH)) {
      currentMembers = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, "utf-8"));
    } else {
      currentMembers = [...DEFAULT_TEAM];
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

  // 1. Delete from Supabase (only if ID is a valid UUID)
  try {
    const supabase = await createClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUUID) {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (!error) {
        supabaseSaved = true;
      } else {
        console.warn("Supabase delete team member error:", error);
      }
    }
  } catch (err) {
    console.warn("Supabase delete team member connection error:", err);
  }

  // 2. Update local file
  try {
    let currentMembers: TeamMember[] = [];
    if (fs.existsSync(TEAM_FILE_PATH)) {
      currentMembers = JSON.parse(fs.readFileSync(TEAM_FILE_PATH, "utf-8"));
    } else {
      currentMembers = [...DEFAULT_TEAM];
    }
    currentMembers = currentMembers.filter(m => m.id !== id);
    await saveTeamLocalFallback(currentMembers);
    return true;
  } catch (err) {
    console.error("Local team file delete error:", err);
    return supabaseSaved;
  }
}
