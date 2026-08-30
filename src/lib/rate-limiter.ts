/**
 * In-memory sliding-window rate limiter for sensitive endpoints.
 * Protects against brute-force UTR submission and spam draft generation.
 *
 * ⚠️  SERVERLESS NOTE: This map resets on every cold start (Vercel, Netlify, etc.).
 *     For production, replace with a persistent store (Upstash Redis, Supabase table).
 *     As a mitigation, Cloudflare Turnstile provides bot-level protection on top of this.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((time) => now - time < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetTime = oldest + windowMs;
    return {
      success: false,
      remaining: 0,
      resetTime,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: limit - record.timestamps.length,
    resetTime: now + windowMs,
  };
}

/**
 * Extract the real client IP from incoming request headers.
 *
 * Priority order (most trusted → least trusted):
 *  1. cf-connecting-ip  — Set by Cloudflare; cannot be spoofed by clients
 *  2. x-real-ip         — Set by some reverse proxies (nginx, etc.)
 *  3. x-forwarded-for   — First IP; LAST resort — easily spoofed without a trusted proxy
 */
export function getClientIp(request: Request): string {
  // Highest trust: Cloudflare's authenticated real-IP header
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  // Nginx / other reverse proxies
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Last resort — take the first entry (the original client before any proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "127.0.0.1";
}
