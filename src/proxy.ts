// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
/**
 * Next.js Edge Middleware — TEDxGCEM
 *
 * Responsibilities:
 *  1. Refresh Supabase auth session on every request (keeps JWTs alive)
 *  2. Track user activity via the `last_active` cookie
 *  3. Auto-sign-out users who have been inactive for more than 7 days
 *
 * This file MUST be named `proxy.ts` and live at `src/proxy.ts`
 * for Next.js 16 to pick it up automatically as the proxy/middleware handler.
 * (In earlier Next.js versions this was `middleware.ts` — Next.js 16 renamed it.)
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** 7 days in milliseconds — inactivity threshold for auto sign-out */
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** 30 days in seconds — lifetime of the `last_active` cookie */
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );

  // Refresh session if expired — IMPORTANT: do not remove this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const lastActiveCookie = request.cookies.get("last_active")?.value;
    const now = Date.now();

    if (lastActiveCookie) {
      const lastActiveTime = parseInt(lastActiveCookie, 10);

      if (!isNaN(lastActiveTime) && now - lastActiveTime > SEVEN_DAYS_MS) {
        // User has been inactive for more than 7 days — sign out
        await supabase.auth.signOut();
        supabaseResponse.cookies.set("last_active", "", {
          path: "/",
          maxAge: -1,
        });
      } else {
        // Active — refresh the last_active timestamp
        supabaseResponse.cookies.set("last_active", now.toString(), {
          path: "/",
          maxAge: THIRTY_DAYS_SECONDS,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
    } else {
      // First visit or missing cookie — initialise it
      supabaseResponse.cookies.set("last_active", now.toString(), {
        path: "/",
        maxAge: THIRTY_DAYS_SECONDS,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  } else {
    // Not authenticated — clear any stale last_active cookie
    if (request.cookies.has("last_active")) {
      supabaseResponse.cookies.set("last_active", "", {
        path: "/",
        maxAge: -1,
      });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static  (static files)
     * - _next/image   (image optimisation files)
     * - favicon.ico   (favicon file)
     * - image files   (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
