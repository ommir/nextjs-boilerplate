import type { NextConfig } from "next";

/**
 * The Supabase host, derived from the configured project URL so images and
 * `connect-src` follow the environment instead of being hard-coded.
 */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
})();

const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";
const supabaseSocket = supabaseHost ? `wss://${supabaseHost}` : "";

/**
 * Content Security Policy.
 *
 * `script-src` carries 'unsafe-inline' because Next's App Router bootstraps
 * hydration with inline scripts; moving to a per-request nonce requires
 * threading it through middleware and is the natural next hardening step.
 * 'unsafe-eval' is dev-only — the React Refresh runtime needs it, production
 * does not.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://picsum.photos https://fastly.picsum.photos https://images.unsplash.com ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseSocket}`.trim(),
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // Demo product imagery for mock mode.
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Uploaded product images live in Supabase Storage.
      ...(supabaseHost
        ? ([{ protocol: "https", hostname: supabaseHost }] as const)
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
