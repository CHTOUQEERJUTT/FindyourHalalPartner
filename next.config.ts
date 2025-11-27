import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "via.placeholder.com", // for placeholder image
      "lh3.googleusercontent.com", // for Google profile images
    ],
  },
};

export default nextConfig;
