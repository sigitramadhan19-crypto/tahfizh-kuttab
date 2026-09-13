import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Remove all query parameters (like ?sslmode=require) so they don't override the ssl object
const connectionString = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('?')[0] : undefined;

// Ensure SSL is handled correctly for Postgres (like Aiven/Supabase)
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
// Without this, an idle connection error (e.g. Aiven dropping a stale
// connection) throws an unhandled 'error' event and crashes the whole
// Node process mid-request instead of just failing that one query.
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client:", err);
});
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
