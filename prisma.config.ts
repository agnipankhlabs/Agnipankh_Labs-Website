import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 moved the connection URL out of schema.prisma and into this file.
 * The datasource block in prisma/schema.prisma is now provider-only.
 *
 * NOTE: this deliberately reads process.env directly rather than using Prisma's
 * `env()` helper. `env()` throws when the variable is missing, and every CLI
 * command — including `prisma generate` — parses this file. Since `generate`
 * runs on `postinstall`, using `env()` would break `npm ci` on any machine or CI
 * runner without a database URL, even though generation never needs one.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
