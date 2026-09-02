import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Content-Security-Policy — crafted precisely for TEDxGCEM's service stack:
//   • Supabase  (API + Storage)     → wpiujexqajeseifzuxnc.supabase.co
//   • Cloudflare Turnstile (CAPTCHA)→ challenges.cloudflare.com
//   • Google Fonts                  → fonts.googleapis.com / fonts.gstatic.com
//   • Resend (email)                → server-side only, no browser entry needed
// ---------------------------------------------------------------------------
const SUPABASE_HOST = "https://wpiujexqajeseifzuxnc.supabase.co";
const SUPABASE_WSS  = "wss://wpiujexqajeseifzuxnc.supabase.co";

const cspDirectives: Record<string, string[]> = {
  // Default: only this origin
  "default-src": ["'self'"],

  // Scripts: self + Cloudflare Turnstile widget + Next.js inline chunks
  // 'unsafe-inline' is required by Next.js for its inline <script> bootstrapping.
  // 'unsafe-eval' is required in development by Next.js HMR; removed in prod via env check.
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://challenges.cloudflare.com",
  ],

  // Styles: self + Google Fonts stylesheet + Next.js inline critical CSS
  "style-src": [
    "'self'",
    "'unsafe-inline'",          // Next.js injects critical CSS inline
    "https://fonts.googleapis.com",
  ],

  // Fonts: self + Google Fonts CDN
  "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],

  // Images:
  //   blob:  → screenshot preview (FileReader → createObjectURL)
  //   data:  → QR code SVG data URIs
  //   Supabase storage → payment proof screenshots
  "img-src": ["'self'", "blob:", "data:", SUPABASE_HOST],

  // API fetch / WebSocket calls:
  //   Supabase REST API + Realtime (wss for live draft-status polling)
  //   Cloudflare Turnstile token validation
  "connect-src": [
    "'self'",
    SUPABASE_HOST,
    SUPABASE_WSS,
    "https://challenges.cloudflare.com",
  ],

  // Iframes: only Cloudflare Turnstile renders in an iframe
  "frame-src": ["https://challenges.cloudflare.com"],

  // Workers: Next.js service worker (if any)
  "worker-src": ["'self'", "blob:"],

  // Manifest: PWA manifest file
  "manifest-src": ["'self'"],

  // Object/embed: block Flash and plugins entirely
  "object-src": ["'none'"],

  // Base URI: prevent base-tag injection attacks
  "base-uri": ["'self'"],

  // Form targets: only POST to this origin
  "form-action": ["'self'"],

  // Prevent this page from being framed anywhere (belt-and-suspenders with X-Frame-Options)
  "frame-ancestors": ["'none'"],
};

const cspHeader = Object.entries(cspDirectives)
  .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
  .join("; ");

const securityHeaders = [
  // Prevent browsers from MIME-sniffing a response away from the declared content-type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deny framing of this site in iframes (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },
  // Referrer Policy: only send origin on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features that are not needed
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // HSTS: enforce HTTPS for 1 year
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Content Security Policy — blocks XSS, data theft, and malicious injections
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
];

const nextConfig: NextConfig = {
  // Allow local network mobile devices to access dev resources & HMR
  allowedDevOrigins: ["192.168.1.8", "192.168.1.8:3000", "localhost:3000"],

  // Remove the "X-Powered-By: Next.js" header (security best practice)
  poweredByHeader: false,

  // Enable gzip/brotli compression
  compress: true,

  // Security headers applied to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Optimise images: serve WebP/AVIF where supported
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
