import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const lastActiveCookie = request.cookies.get("last_active")?.value;
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (lastActiveCookie) {
      const lastActiveTime = parseInt(lastActiveCookie, 10);
      if (!isNaN(lastActiveTime) && now - lastActiveTime > sevenDaysInMs) {
        // User has been inactive for more than 7 days, sign out
        await supabase.auth.signOut();
        // Clear last_active cookie
        supabaseResponse.cookies.set("last_active", "", {
          path: "/",
          maxAge: -1,
        });
      } else {
        // Active! Update last_active cookie.
        // Set maxAge to 30 days to ensure it lives long enough for the 7-day inactivity check.
        supabaseResponse.cookies.set("last_active", now.toString(), {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
    } else {
      // First time or missing cookie, initialize it
      supabaseResponse.cookies.set("last_active", now.toString(), {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  } else {
    // If not authenticated, ensure last_active is cleared if it exists
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any image file (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
