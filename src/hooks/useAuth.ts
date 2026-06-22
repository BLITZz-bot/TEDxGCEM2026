import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js"; // Importing type definitions is safe and does not bundle code

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/user");
      const data = await res.json();
      const currentUser = data.user;
      setUser(currentUser);
      await checkAdminStatus(currentUser);
    } catch (err) {
      console.error("Error fetching user session server-side:", err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser || !currentUser.email) {
      setIsAdmin(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/admin-check");
      const data = await res.json();
      setIsAdmin(!!data.isAdmin);
    } catch (err) {
      console.error("Failed to check admin status server-side:", err);
      setIsAdmin(false);
    }
  };

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
        setUser(null);
        setIsAdmin(false);
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
