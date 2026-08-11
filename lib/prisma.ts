import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import pg from "pg";

config({ path: ".env.local" });
config({ path: ".env" });

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL for Prisma.");
}

const databaseUrl = new URL(connectionString);
databaseUrl.searchParams.delete("sslmode");

const pool = new pg.Pool({
  connectionString: databaseUrl.toString(),
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

process.on("beforeExit", async () => {
  await pool.end();
});
