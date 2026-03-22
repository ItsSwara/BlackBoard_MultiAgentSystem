import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  serverExternalPackages: [
    "@neondatabase/serverless",
    "@mastra/core",
    "@ai-sdk/anthropic",
    "ai",
  ],
=======
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Required for @powersync/web WASM
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Handle WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
>>>>>>> c82d7ec0c3afbc798ab926f91a33a5f81a5b6290
};

export default nextConfig;
