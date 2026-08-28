// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/utils/date
 *
 * Date and time utility functions for TEDxGCEM event data.
 */

/**
 * Extract a 4-digit year string from an event date value.
 *
 * Handles multiple input formats:
 *  - ISO 8601 date strings (`"2026-09-26T09:00:00"`)
 *  - Human-readable strings (`"September 26, 2026"`, `"THURSDAY, 26 SEPT 2026"`)
 *  - Partial strings with a 4-digit year anywhere in the string
 *
 * Falls back to `"2026"` when the input is null/undefined/unparseable.
 *
 * @param eventDate - Raw event date value from settings (may be `null`)
 * @returns A 4-digit year as a string
 *
 * @example
 *   getEventYear("2026-09-26T09:00:00") // "2026"
 *   getEventYear("September 26, 2026")  // "2026"
 *   getEventYear(null)                  // "2026"
 */
export function getEventYear(eventDate?: string | null): string {
  if (!eventDate) return "2026";
  try {
    const date = new Date(eventDate);
    if (!isNaN(date.getTime())) {
      return String(date.getFullYear());
    }
    const parts = eventDate.trim().split(" ");
    const lastPart = parts[parts.length - 1];
    if (lastPart && /^\d{4}$/.test(lastPart)) {
      return lastPart;
    }
    const match = eventDate.match(/\b\d{4}\b/);
    if (match) {
      return match[0];
    }
  } catch {
    // Ignore parse errors — fall through to default
  }
  return "2026";
}
