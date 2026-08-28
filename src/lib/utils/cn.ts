// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/utils/cn
 *
 * Class name utility — merges Tailwind CSS class strings with full
 * conflict-resolution support via `clsx` and `tailwind-merge`.
 *
 * @example
 *   cn("px-4 py-2", condition && "text-red-500", "text-white")
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge and deduplicate Tailwind CSS class strings.
 * Conflicts are resolved by tailwind-merge (last class wins).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
