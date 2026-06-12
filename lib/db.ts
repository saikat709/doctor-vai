import {
  PrismaClient as PrismaClientClass,
  type PrismaClient as PrismaClientInstance,
} from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { vector } from "@electric-sql/pglite/vector";
import { isOffline } from "@/lib/env";
import { getOfflineDbDirectory } from "@/lib/env-node";

type PrismaRuntime = {
  client: PrismaClientInstance;
  connectionString: string;
};

const globalForPrisma = globalThis as unknown as {
  prismaRuntime: Promise<PrismaRuntime> | undefined;
  prismaClient: PrismaClientInstance | undefined;
  pgliteServerStarted: boolean | undefined;
};

async function createOfflineRuntime(): Promise<PrismaRuntime> {
  const dbPath = getOfflineDbDirectory();
  const pglite = await PGlite.create(dbPath, {
    extensions: {
      vector,
    },
  });
  const server = new PGLiteSocketServer({
    db: pglite,
    host: "127.0.0.1",
    port: 0,
    maxConnections: 4,
  });

  await server.start();

  const connectionString = server.getServerConn();
  const adapter = new PrismaPg(connectionString);

  return {
    client: new PrismaClientClass({ adapter }),
    connectionString,
  };
}

async function createOnlineRuntime(): Promise<PrismaRuntime> {
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";
  const adapter = new PrismaPg(connectionString);

  return {
    client: new PrismaClientClass({ adapter }),
    connectionString,
  };
}

const runtimePromise =
  globalForPrisma.prismaRuntime ??
  (isOffline ? createOfflineRuntime() : createOnlineRuntime());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaRuntime = runtimePromise;
}

const runtime = await runtimePromise;

export const db: PrismaClientInstance =
  globalForPrisma.prismaClient ?? runtime.client;
export const dbConnectionString = runtime.connectionString;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = db;
}
