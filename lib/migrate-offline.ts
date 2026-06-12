import { execFileSync } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { vector } from "@electric-sql/pglite/vector";
import { getOfflineDbDirectory } from "@/lib/env-node";

export async function migrateOffline() {
  const db = await PGlite.create(getOfflineDbDirectory(), {
    extensions: {
      vector,
    },
  });
  const server = new PGLiteSocketServer({
    db,
    host: "127.0.0.1",
    port: 0,
    maxConnections: 1,
  });

  console.log("Running offline migrations...");
  await server.start();

  try {
    const databaseUrl = server.getServerConn();

    execFileSync(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["prisma", "migrate", "deploy"],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          DATABASE_URL_UNPOOLED: databaseUrl,
        },
      }
    );
    console.log("Migrations complete.");
  } finally {
    await server.stop();
    await db.close();
  }
}
