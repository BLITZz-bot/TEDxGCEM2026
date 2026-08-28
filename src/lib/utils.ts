/**
 * @deprecated
 * This file is a backwards-compatibility shim.
 * New code should import from `@/lib/utils` (which resolves to `@/lib/utils/index.ts`).
 *
 * All exports are re-exported from the canonical locations:
 *  - `cn`           → `@/lib/utils/cn`
 *  - `getEventYear` → `@/lib/utils/date`
 */

export { cn } from "@/lib/utils/cn";
export { getEventYear } from "@/lib/utils/date";
