/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker / self-hosted deployments
  output: "standalone",

  // Limit build workers to 1 to prevent OOM in memory-constrained CI environments
  experimental: {
    cpus: 1,
  },

  // Pin build ID to commit hash so Next.js reuses its incremental cache across runs
  generateBuildId: async () => {
    return process.env.BITBUCKET_COMMIT ?? "local";
  },

  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
