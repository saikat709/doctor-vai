import path from "node:path";

export function getOfflineDbDirectory() {
  return process.env.ELECTRON_USER_DATA
    ? path.join(process.env.ELECTRON_USER_DATA, "healthworker.db")
    : path.join(process.cwd(), ".pglite-dev", "healthworker.db");
}
