import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js"; // Importing type definitions is safe and does not bundle code

// Global cache variables visible to all instances of useAuth
let globalUser: User | null = null;
let globalIsAdmin = false;
let globalLoading = true;
let isFetching = false;
const listeners = new Set<() => void>();

export function useAuth() {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(globalLoading);
  const [isAdmin, setIsAdmin] = useState(globalIsAdmin);

  const fetchSession = async () => {
    if (isFetching) return;
    isFetching = true;
    try {
      const res = await fetch("/api/auth/user");
      if (!res.ok) {
        throw new Error(`Session check failed with status: ${res.status}`);
      }
      const data = await res.json();
      const currentUser = data?.user || null;
      globalUser = currentUser;

      if (currentUser && currentUser.email) {
        try {
          const resAdmin = await fetch("/api/auth/admin-check");
          if (resAdmin.ok) {
            const dataAdmin = await resAdmin.json();
            globalIsAdmin = !!dataAdmin.isAdmin;
          }
        } catch {
          globalIsAdmin = false;
        }
      } else {
        globalIsAdmin = false;
      }
    } catch {
      // Benign network check when server is restarting or offline
      globalUser = null;
      globalIsAdmin = false;
    } finally {
      globalLoading = false;
      isFetching = false;
      listeners.forEach((l) => l());
    }
  };

  useEffect(() => {
    const onChange = () => {
      setUser(globalUser);
      setLoading(globalLoading);
      setIsAdmin(globalIsAdmin);
    };
    listeners.add(onChange);

    // Only run fetchSession once on the first instance mount
    if (globalLoading && !isFetching) {
      fetchSession();
    }

    // Set up activity listener to update last_active cookie
    let lastUpdate = Date.now();
    const updateCookie = () => {
      const now = Date.now();
      // Throttle updates to once every 5 minutes (300,000 ms)
      if (now - lastUpdate > 5 * 60 * 1000) {
        lastUpdate = now;
        const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
        document.cookie = `last_active=${now}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      }
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, updateCookie, { passive: true }));

    // Listen for tab focus/visibility change with a 15-second throttle
    let lastFocusFetch = 0;
    const handleFocus = () => {
      const now = Date.now();
      if (document.visibilityState === "visible" && now - lastFocusFetch > 15000) {
        lastFocusFetch = now;
        fetchSession();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // Initialize cookie on mount if logged in
    if (globalUser) {
      const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
      document.cookie = `last_active=${Date.now()}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
    }

    return () => {
      listeners.delete(onChange);
      events.forEach((e) => window.removeEventListener(e, updateCookie));
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await fetch("/api/auth/login", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to generate Google Sign-In URL.");
      }
    } catch (error) {
      console.error("Google Auth Redirect Error:", error);
    }
  };

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        globalUser = null;
        globalIsAdmin = false;
        globalLoading = false;
        listeners.forEach((l) => l());
        window.location.reload(); // Refresh screen to reset all tab states
      } else {
        throw new Error(data.error || "Failed to log out.");
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return { user, loading, isAdmin, loginWithGoogle, logout };
}
