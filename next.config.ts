import type { NextConfig } from "next";

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
];

const nextConfig: NextConfig = {
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
