import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Default to the local pglite dev DB. `pgbouncer=true` makes Prisma use
// unnamed prepared statements (pglite reuses one backend connection);
// `connection_limit=1` matches the single-connection socket server.
process.env.DATABASE_URL ||=
  "postgresql://postgres:postgres@127.0.0.1:5433/postgres?pgbouncer=true&connection_limit=1";
process.env.TOKEN_ENCRYPTION_KEY ||= "";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    // pglite serves one backend connection — don't run DB suites concurrently.
    fileParallelism: false,
  },
});
