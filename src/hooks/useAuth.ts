// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.
"use client";

/**
 * @module hooks/useAuth
 *
 * Global authentication hook for TEDxGCEM.
 *
 * ## Architecture: Module-level cache
 *
 * Auth state is stored in module-level variables (not React state) so that a
 * single API call is shared across every component that mounts `useAuth`.
 * A lightweight pub/sub listener set (`listeners`) notifies all mounted
 * instances when state changes, keeping them in sync without a Context Provider
 * or an external state library.
 *
 * This pattern is intentional â€” it avoids prop-drilling and reduces waterfall
 * network requests when multiple components need the current user.
 *
 * ## Session lifecycle
 *
 * - Session is fetched once on the first `useAuth` mount.
 * - Re-fetched when the tab regains focus (15 s throttle).
 * - Activity events (`mousedown`, `keydown`, etc.) refresh the `last_active`
 *   cookie, which the middleware uses to auto sign-out after 7 days of
 *   inactivity.
 */

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Throttle activity-cookie updates to once every 5 minutes */
const ACTIVITY_THROTTLE_MS = 5 * 60 * 1000;

/** Throttle focus/visibility refetch to once every 15 seconds */
const FOCUS_REFETCH_THROTTLE_MS = 15_000;

/** Max-age (in seconds) for the `last_active` cookie â€” 30 days */
const LAST_ACTIVE_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

/** DOM events that constitute "activity" from the user */
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

// â”€â”€â”€ Module-level auth cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let globalUser: User | null = null;
let globalIsAdmin = false;
let globalLoading = true;
let isFetching = false;
const listeners = new Set<() => void>();

// â”€â”€â”€ Internal helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Build a `last_active` cookie string with the current timestamp */
function buildLastActiveCookie(timestamp: number): string {
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  return (
    `last_active=${timestamp}; path=/; max-age=${LAST_ACTIVE_COOKIE_MAX_AGE}; SameSite=Lax` +
    (isSecure ? "; Secure" : "")
  );
}

/** Notify all subscribed useAuth instances of a state change */
function notifyListeners(): void {
  listeners.forEach((l) => l());
}

/** Fetch session and admin status, then notify all listeners */
async function fetchSession(): Promise<void> {
  if (isFetching) return;
  isFetching = true;
  try {
    const res = await fetch("/api/auth/user");
    if (!res.ok) {
      throw new Error(`Session check failed with status: ${res.status}`);
    }
    const data = await res.json();
    const currentUser: User | null = data?.user ?? null;
    globalUser = currentUser;

    if (currentUser?.email) {
      try {
        const adminRes = await fetch("/api/auth/admin-check");
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          globalIsAdmin = !!adminData.isAdmin;
        }
      } catch {
        globalIsAdmin = false;
      }
    } else {
      globalIsAdmin = false;
    }
  } catch {
    // Benign: server may be restarting or temporarily unreachable
    globalUser = null;
    globalIsAdmin = false;
  } finally {
    globalLoading = false;
    isFetching = false;
    notifyListeners();
  }
}

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(globalLoading);
  const [isAdmin, setIsAdmin] = useState(globalIsAdmin);

  useEffect(() => {
    // Subscribe to state changes from the module-level cache
    const onChange = () => {
      setUser(globalUser);
      setLoading(globalLoading);
      setIsAdmin(globalIsAdmin);
    };
    listeners.add(onChange);

    // Fetch session on first mount only
    if (globalLoading && !isFetching) {
      fetchSession();
    }

    // Activity cookie: throttled update so the middleware can track inactivity
    let lastActivityUpdate = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityUpdate > ACTIVITY_THROTTLE_MS) {
        lastActivityUpdate = now;
        document.cookie = buildLastActiveCookie(now);
      }
    };
    ACTIVITY_EVENTS.forEach((e) =>
      window.addEventListener(e, handleActivity, { passive: true })
    );

    // Re-fetch session when tab regains focus (throttled)
    let lastFocusFetch = 0;
    const handleFocus = () => {
      const now = Date.now();
      if (document.visibilityState === "visible" && now - lastFocusFetch > FOCUS_REFETCH_THROTTLE_MS) {
        lastFocusFetch = now;
        fetchSession();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // Initialise the activity cookie immediately if already logged in
    if (globalUser) {
      document.cookie = buildLastActiveCookie(Date.now());
    }

    return () => {
      listeners.delete(onChange);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, handleActivity));
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const res = await fetch("/api/auth/login", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Failed to generate Google Sign-In URL.");
      }
    } catch (error) {
      console.error("[useAuth] Google Auth Redirect Error:", error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        globalUser = null;
        globalIsAdmin = false;
        globalLoading = false;
        notifyListeners();
        window.location.reload();
      } else {
        throw new Error(data.error ?? "Failed to log out.");
      }
    } catch (error) {
      console.error("[useAuth] Logout Error:", error);
    }
  };

  return { user, loading, isAdmin, loginWithGoogle, logout };
}
