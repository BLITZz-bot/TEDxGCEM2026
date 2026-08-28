// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/supabase/server
 *
 * Server-side Supabase client factory for Next.js Server Components,
 * Route Handlers, and Server Actions.
 *
 * Uses `@supabase/ssr` to correctly handle cookie-based auth sessions
 * in server contexts.
 *
 * âš ï¸  Do NOT use this in Client Components â€” the server client reads cookies
 *     from the server-side cookie store, which is only available on the server.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create and return an authenticated Supabase client for server-side use.
 *
 * Must be awaited because the `cookies()` call from `next/headers` is async
 * in Next.js 15+.
 *
 * @throws Will not throw on missing env vars in development â€” Next.js will
 *         surface an appropriate error. In production, ensure `SUPABASE_URL`
 *         and `SUPABASE_ANON_KEY` are set in your environment.
 */
export async function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "[supabase/server] Missing required environment variables: " +
        "SUPABASE_URL and SUPABASE_ANON_KEY must be set. " +
        "Copy .env.example to .env.local and fill in the values."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
            })
          );
        } catch {
          // `setAll` can be called from a Server Component where cookies are
          // read-only. This is safe to ignore because the middleware refreshes
          // the session before the component renders.
        }
      },
    },
  });
}
