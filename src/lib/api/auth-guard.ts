// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * @module lib/api/auth-guard
 *
 * Shared admin authentication guard for Next.js API Route Handlers.
 *
 * Every admin API route repeats the same "get user â†’ check email â†’ compare
 * with ADMIN_EMAIL env var" pattern. This module centralises that logic so
 * each route stays focused on its own business logic.
 *
 * @example
 *   import { requireAdmin } from "@/lib/api/auth-guard";
 *
 *   export async function GET() {
 *     const { supabase, error } = await requireAdmin();
 *     if (error) return error; // returns a NextResponse 401
 *     // ... use supabase safely
 *   }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AdminGuardSuccess {
  supabase: SupabaseClient;
  error: null;
}

interface AdminGuardFailure {
  supabase: null;
  error: NextResponse;
}

type AdminGuardResult = AdminGuardSuccess | AdminGuardFailure;

/**
 * Verifies the current request is made by the configured admin user.
 *
 * Returns a Supabase client on success, or a pre-built 401 NextResponse on
 * failure â€” so the caller can simply `return error` without extra boilerplate.
 *
 * @returns `{ supabase, error: null }` on success
 * @returns `{ supabase: null, error: NextResponse }` on failure
 */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      supabase: null,
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const isAdmin = user.email.toLowerCase() === adminEmail.toLowerCase();

  if (!isAdmin) {
    return {
      supabase: null,
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  return { supabase, error: null };
}
