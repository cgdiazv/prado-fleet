import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Set DATABASE_URL or DIRECT_URL in your environment.");
}

const normalizedDatabaseUrl = databaseUrl.includes("sslmode=")
  ? databaseUrl
  : `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}sslmode=require`;

export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma", "schema.prisma"),
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: normalizedDatabaseUrl,
  },
});
