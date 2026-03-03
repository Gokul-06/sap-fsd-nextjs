import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  // DATABASE_URL is used by migrate commands via the adapter in lib/db.ts
  // For shadow database during migrations, set DIRECT_URL in your environment
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
