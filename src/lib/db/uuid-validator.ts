// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/db/uuid-validator
 *
 * Shared UUID validation utility.
 *
 * Supabase uses UUID v4 as primary keys. Local fallback records use short
 * random IDs (e.g., `Math.random().toString(36).substring(2, 9)`).
 *
 * This validator ensures we only attempt Supabase updates/deletes for records
 * that actually have a valid UUID primary key.
 */

/** UUID v4 regex pattern */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns `true` if the given string is a valid UUID v4.
 *
 * @param id - The ID string to test
 * @returns `true` for valid UUID v4, `false` otherwise
 *
 * @example
 *   isValidUUID("550e8400-e29b-41d4-a716-446655440000") // true
 *   isValidUUID("abc123xyz")                            // false
 */
export function isValidUUID(id: string): boolean {
  return UUID_V4_REGEX.test(id);
}
