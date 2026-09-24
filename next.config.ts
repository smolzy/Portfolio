import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS: force HTTPS for 2 years, including subdomains
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // CSP: restrict sources to known origins
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Scripts: self + inline (Next.js needs unsafe-inline for hydration)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com",
      // Styles: self + inline + Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + Cloudinary + data URIs
      "img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com https://img.youtube.com",
      // Media (video/audio)
      "media-src 'self' https://res.cloudinary.com",
      // Connections (fetch/XHR)
      "connect-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      // YouTube IFrame embeds
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
      // No objects/embeds
      "object-src 'none'",
      // No framing from outside
      "frame-ancestors 'none'",
      // Base URI restricted to self
      "base-uri 'self'",
      // Form submissions only to self
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Do not expose the Next.js version in the X-Powered-By header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Restrict to image/upload paths only (blocks /video/, /raw/, etc.)
        // The ** after upload covers version segments (e.g. v1234567/) before the folder
        pathname: "/*/image/upload/**",
      },
    ],
    // Enable modern formats for browsers that support them
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600, // 1 hour
  },

  // Compress responses
  compress: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
