import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEventYear(eventDate?: string | null): string {
  if (!eventDate) return "2026";
  try {
    const date = new Date(eventDate);
    if (!isNaN(date.getTime())) {
      return String(date.getFullYear());
    }
    const parts = eventDate.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    if (/^\d{4}$/.test(lastPart)) {
      return lastPart;
    }
    const match = eventDate.match(/\b\d{4}\b/);
    if (match) {
      return match[0];
    }
  } catch (e) {
    // ignore
  }
  return "2026";
}
