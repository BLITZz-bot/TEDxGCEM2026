// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/db/local-store
 *
 * Generic typed utility for reading and writing JSON data files used as a
 * local fallback store when Supabase is unavailable.
 *
 * All TEDxGCEM services use a dual-write strategy:
 *  1. Primary: Supabase (remote DB)
 *  2. Fallback: local JSON file in `data/`
 *
 * This module centralises the file I/O so the pattern is not repeated across
 * every service file.
 */

import fs from "fs";

/**
 * Read a JSON array from a local file.
 *
 * @param filePath - Absolute path to the JSON file (use `path.join(process.cwd(), ...)`)
 * @param fallback - Value to return when the file is missing or unreadable
 * @returns Parsed array, or `fallback` on any error
 */
export function readLocalStore<T>(filePath: string, fallback: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    }
  } catch (err) {
    console.warn(`[local-store] Read error for ${filePath}:`, err);
  }
  return fallback;
}

/**
 * Persist a JSON array to a local file (pretty-printed for readability).
 *
 * @param filePath - Absolute path to the JSON file
 * @param data     - Array to serialise and write
 */
export function saveLocalStore<T>(filePath: string, data: T[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(`[local-store] Write error for ${filePath}:`, err);
  }
}
