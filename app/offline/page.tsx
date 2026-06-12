import Link from "next/link";
import { Download, LaptopMinimal, MonitorCog, TerminalSquare } from "lucide-react";

const downloads = [
  {
    name: "Windows Setup",
    file: "/offline/windows-setup.exe",
    platform: "Windows",
    description:
      "Installer package for the Electron desktop build. Place your generated setup file at public/offline/windows-setup.exe.",
  },
  {
    name: "Linux AppImage",
    file: "/offline/doctor-vai.appimage",
    platform: "Linux",
    description:
      "Portable AppImage build for Linux. Place your generated artifact at public/offline/doctor-vai.appimage.",
  },
];

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="overflow-hidden rounded-[36px] border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              <Download className="h-3.5 w-3.5" />
              Offline Desktop Builds
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Download Doctor Vai for field use.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              This page is wired to serve your packaged Electron artifacts from
              `public/offline`. Copy the Windows installer and Linux AppImage
              into that folder and these buttons will point to them directly.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {downloads.map((item) => (
            <article
              key={item.file}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                    {item.platform}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {item.name}
                  </h2>
                </div>
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <LaptopMinimal className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
              <a
                href={item.file}
                download
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Download className="h-4 w-4" />
                Download {item.platform}
              </a>
              <p className="mt-3 text-xs text-slate-500">{item.file}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <TerminalSquare className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-950">
                Run Instructions
              </h2>
            </div>
            <div className="mt-5 space-y-5 text-sm leading-6 text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Windows</p>
                <p>1. Download `windows-setup.exe` and complete the installer.</p>
                <p>2. Install Ollama and pull a model such as `llama3`.</p>
                <p>3. Open Doctor Vai, go to Settings, and finish Connect Local.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Linux</p>
                <p>1. Download `doctor-vai.appimage`.</p>
                <p>2. Mark it executable with `chmod +x doctor-vai.appimage`.</p>
                <p>3. Run it with `./doctor-vai.appimage`, then configure Local AI from Settings.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <MonitorCog className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-950">
                Build Placement
              </h2>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p>Copy your Electron outputs here:</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700">
                public/offline/windows-setup.exe
                <br />
                public/offline/doctor-vai.appimage
              </div>
              <Link
                href="/dashboard/settings#local-ai"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
              >
                Open Local AI Settings
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
