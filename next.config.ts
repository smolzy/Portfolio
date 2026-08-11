import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // Enable modern formats for browsers that support them
    formats: ["image/avif", "image/webp"],
    // Cloudinary handles its own optimization (f_auto,q_auto),
    // disable Next.js image optimization to avoid double-processing
    // Keep minimumCacheTTL high to leverage CDN caching
    minimumCacheTTL: 3600, // 1 hour
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
