/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

process.env.OFFLINE = process.env.OFFLINE ?? "true";
process.env.ELECTRON_USER_DATA = app.getPath("userData");

async function runOfflineMigrations() {
  const migrateModule = await import("../lib/migrate-offline.ts");
  await migrateModule.migrateOffline();
}

function resolveProductionEntry() {
  const candidates = [
    path.join(process.cwd(), "out", "index.html"),
    path.join(__dirname, "..", "out", "index.html"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

async function createWindow() {
  if (process.env.OFFLINE === "true") {
    try {
      await runOfflineMigrations();
    } catch (error) {
      console.error("[ELECTRON_MIGRATION_ERROR]", error);
      dialog.showErrorBox(
        "Startup Error",
        "Database migration failed. Please restart."
      );
      app.quit();
      return;
    }
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    title: "Doctor Vai",
    icon: path.join(process.cwd(), "public", "doctor.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    await win.loadURL("http://127.0.0.1:3000");
    win.webContents.openDevTools({ mode: "detach" });
    return;
  }

  const entry = resolveProductionEntry();

  if (!entry) {
    dialog.showErrorBox(
      "Build Missing",
      "No exported production entry was found. Run the Electron build first."
    );
    app.quit();
    return;
  }

  await win.loadFile(entry);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
