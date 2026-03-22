import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@neondatabase/serverless",
    "@mastra/core",
    "@ai-sdk/anthropic",
    "ai",
  ],
};

export default nextConfig;
