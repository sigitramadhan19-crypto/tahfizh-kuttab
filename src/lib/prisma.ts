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
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
