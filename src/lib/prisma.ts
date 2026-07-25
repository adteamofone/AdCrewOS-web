import { PrismaClient } from "@prisma/client";

/**
 * Resolve the runtime connection string.
 * When pointed at a transaction pooler (e.g. Neon/PgBouncer, host contains
 * "-pooler"), Prisma must run in pgbouncer mode or it throws
 * "prepared statement \"s0\" already exists". We append the flags defensively
 * so the same code works locally (direct Postgres/pglite) and on Vercel (Neon).
 */
function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return raw;
  const pooled = raw.includes("-pooler") || raw.includes("pgbouncer=true");
  if (!pooled) return raw;
  const [base, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  params.set("pgbouncer", "true");
  if (!params.has("connection_limit")) params.set("connection_limit", "1");
  return `${base}?${params.toString()}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const datasourceUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
