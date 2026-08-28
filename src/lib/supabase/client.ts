// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/supabase/client
 *
 * Client-side Supabase access is intentionally disabled for maximum security.
 *
 * All database queries and authentication operations are routed through secure
 * Next.js API Route Handlers (`/api/*`) which run exclusively on the server.
 * This prevents the Supabase service key or any sensitive query logic from
 * being exposed in the browser bundle.
 *
 * If you need to add client-side Supabase functionality in the future, replace
 * this stub with `createBrowserClient` from `@supabase/ssr`.
 */

/**
 * @returns `null` — client-side Supabase access is disabled by design.
 * @see src/lib/supabase/server.ts for the server-side client.
 */
export function createClient(): null {
  return null;
}
