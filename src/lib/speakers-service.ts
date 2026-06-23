import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

export interface Speaker {
  id: string;
  created_at?: string;
  name: string;
  designation: string;
  image_url: string; // holds base64 data string
  email?: string;
  linkedin?: string;
  instagram?: string;
  bio: string;
  details: string;
}

const SPEAKERS_FILE_PATH = path.join(process.cwd(), "src", "lib", "speakers.json");

// Default/Seed Speakers
const DEFAULT_SPEAKERS: Speaker[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    designation: "Neuroscientist & Author",
    image_url: "",
    email: "sarah.chen@tedxgcem.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    bio: "Sarah is a research fellow at the Institute for Human-Centered AI, studying algorithmic accountability and ethics in large-scale generative models.",
    details: "Ph.D. in Computer Science from Stanford. Former lead ethical researcher at DeepMind."
  },
  {
    id: "2",
    name: "Marcus Thorne",
    designation: "Founder & CEO, Future Labs",
    image_url: "",
    email: "marcus.thorne@tedxgcem.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    bio: "An environmental architect specializing in integrating bio-diverse ecosystems into skyscrapers and urban infrastructure.",
    details: "Founder of GreenGrid Studios. TED Senior Fellow and designer of Milan's Vertical Forests."
  },
  {
    id: "3",
    name: "Aisha Roberts",
    designation: "Digital Media Theorist",
    image_url: "",
    email: "aisha.roberts@tedxgcem.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    bio: "A media theorist exploring the application of quantum physics concepts to interactive narratives and digital media.",
    details: "Professor of Digital Media at MIT. Author of 'Schrödinger's Screen'."
  },
  {
    id: "4",
    name: "Julian Voss",
    designation: "Sound Designer & Acoustician",
    image_url: "",
    email: "julian.voss@tedxgcem.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    bio: "A sound designer and acoustician researching the neurological effects of absolute silence in high-noise environments.",
    details: "Acoustic consultant for NASA's quiet spacecraft initiative. Winner of multiple sound engineering awards."
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    designation: "Bionic Architecture Pioneer",
    image_url: "",
    email: "elena.rodriguez@tedxgcem.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    bio: "A pioneer in bio-inspired building design, building self-heating and self-cooling living structures using synthetic materials.",
    details: "Dean of Architecture at Barcelona Tech. Pioneer in biological-material printing."
  },
  {
    id: "6",
    name: "Kenji Tanaka",
    designation: "Mathematician & Author",
    image_url: "",
    email: "kenji.tanaka@tedxgcem.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    bio: "A mathematician and author discovering elegance and simple geometry in chaotic topological networks.",
    details: "Fields Medalist. Research focuses on topological data analysis in social network graphs."
  }
];

export async function getSpeakers(): Promise<Speaker[]> {
  // 1. Try from Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("speakers")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Supabase speakers fetch error, falling back to local file:", err);
  }

  // 2. Try local file
  try {
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      const fileData = fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.warn("Local speakers file read error, returning defaults:", err);
  }

  return DEFAULT_SPEAKERS;
}

export async function saveSpeakersLocalFallback(speakers: Speaker[]): Promise<void> {
  try {
    fs.writeFileSync(SPEAKERS_FILE_PATH, JSON.stringify(speakers, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write local speakers JSON fallback:", err);
  }
}

export async function addSpeaker(speaker: Omit<Speaker, "id">): Promise<boolean> {
  let supabaseSaved = false;
  let newId = Math.random().toString(36).substring(2, 9); // Fallback ID

  // 1. Save to Supabase
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("speakers")
      .insert([speaker])
      .select();

    if (!error && data && data.length > 0) {
      supabaseSaved = true;
      newId = data[0].id;
    } else {
      console.warn("Supabase add speaker error:", error);
    }
  } catch (err) {
    console.warn("Supabase add speaker connection error:", err);
  }

  // 2. Read existing local list, append new speaker, and save
  try {
    let currentSpeakers = DEFAULT_SPEAKERS;
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      currentSpeakers = JSON.parse(fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8"));
    }
    const newSpeaker: Speaker = {
      id: newId,
      ...speaker
    };
    currentSpeakers.push(newSpeaker);
    await saveSpeakersLocalFallback(currentSpeakers);
    return true;
  } catch (err) {
    console.error("Local speakers file append error:", err);
    return supabaseSaved;
  }
}

export async function updateSpeaker(speaker: Speaker): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Save to Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("speakers")
      .update({
        name: speaker.name,
        designation: speaker.designation,
        image_url: speaker.image_url,
        email: speaker.email,
        linkedin: speaker.linkedin,
        instagram: speaker.instagram,
        bio: speaker.bio,
        details: speaker.details
      })
      .eq("id", speaker.id);

    if (!error) {
      supabaseSaved = true;
    } else {
      console.warn("Supabase update speaker error:", error);
    }
  } catch (err) {
    console.warn("Supabase update speaker connection error:", err);
  }

  // 2. Update local file
  try {
    let currentSpeakers = DEFAULT_SPEAKERS;
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      currentSpeakers = JSON.parse(fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8"));
    }
    currentSpeakers = currentSpeakers.map(s => s.id === speaker.id ? speaker : s);
    await saveSpeakersLocalFallback(currentSpeakers);
    return true;
  } catch (err) {
    console.error("Local speakers file update error:", err);
    return supabaseSaved;
  }
}

export async function deleteSpeaker(id: string): Promise<boolean> {
  let supabaseSaved = false;

  // 1. Delete from Supabase
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("speakers")
      .delete()
      .eq("id", id);

    if (!error) {
      supabaseSaved = true;
    } else {
      console.warn("Supabase delete speaker error:", error);
    }
  } catch (err) {
    console.warn("Supabase delete speaker connection error:", err);
  }

  // 2. Update local file
  try {
    let currentSpeakers = DEFAULT_SPEAKERS;
    if (fs.existsSync(SPEAKERS_FILE_PATH)) {
      currentSpeakers = JSON.parse(fs.readFileSync(SPEAKERS_FILE_PATH, "utf-8"));
    }
    currentSpeakers = currentSpeakers.filter(s => s.id !== id);
    await saveSpeakersLocalFallback(currentSpeakers);
    return true;
  } catch (err) {
    console.error("Local speakers file delete error:", err);
    return supabaseSaved;
  }
}
