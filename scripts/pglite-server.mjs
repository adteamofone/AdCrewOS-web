// Ephemeral in-process Postgres (pglite) exposed over the PG wire protocol.
// Used for local dev + tests without a system Postgres install.
// Data persists to ./.pglite so `prisma migrate` + app share the same DB.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const dataDir = process.env.PGLITE_DIR || "./.pglite";
const port = Number(process.env.PGLITE_PORT || 5432);

const db = await PGlite.create(dataDir);
const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });
await server.start();
console.log(`pglite listening on 127.0.0.1:${port} (data: ${dataDir})`);

process.on("SIGINT", async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
