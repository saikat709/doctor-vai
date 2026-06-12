# Project Context: Health Worker Assistant

## Project Overview

An AI-powered decision-support tool designed for frontline field health workers to improve public health delivery. The application focuses on usability in real-world, low-resource environments, practical medical guidance, and data privacy.

## Tech Stack

- **Frontend/Backend:** Next.js (App Router), Tailwind CSS, Shadcn/UI, Lucide React (Icons), Framer Motion (Animations).
- **Auth:** Auth.js (NextAuth v5 beta) with Prisma adapter and credentials flow placeholder.
- **AI/LLM:** DeepSeek for cloud mode, Ollama via Cloudflare Tunnel for local mode, plus a RAG system for private data.
- **Local Storage/State:** LocalStorage / React Context (optimized for offline-first capability where possible).
- **Desktop Runtime:** Electron with offline-mode scaffolding, PGlite-backed Prisma runtime, and packaged download artifacts served from `/offline`.

## Runtime Constraints

- **Edge-safe env split:** `middleware.ts` imports `auth.config.ts`, so anything transitively imported there must stay Edge-compatible.
- `lib/env.ts` is intentionally Edge-safe and must not import Node modules such as `node:path`.
- Node-only offline path resolution lives in `lib/env-node.ts`.
- If future offline/runtime helpers need `fs`, `path`, `process.cwd()`, or Electron-specific APIs, keep them out of `lib/env.ts` and out of middleware/auth config import chains.

## Architecture & Layout

1.  **Landing Page:** Auth-aware root entry with a medical hero, offline/privacy/decision-support message pillars, and a prominent "Go to Dashboard" button.
2.  **Main Layout:** A responsive dashboard shell with a dark-slate left sidebar, active route highlighting, and a fixed bottom-right Ask AI FAB that opens the dedicated Ask AI page.
3.  **Data Sources:** Local files like `/lib/procedures.json` containing standardized medical guidance steps.
4.  **Risk Triage:** Guardrailed diagnostics payloads routed through `/api/diagnostics/risk`, returning only attentionLevel, metrics, and precautions arrays without definitive diagnosis.

## Status Updates

- Added Auth.js scaffolding, a protected `/dashboard/*` workspace shell, an auth-aware landing page that redirects signed-in users to `/dashboard/session`, an animated treatment guidance checklist driven by local procedure JSON, a DeepSeek-style medicine interaction API that returns verdict JSON, and a triage risk screen with guardrailed LLM prompting.
- Added Local AI configuration with a multi-step "Connect Local" settings modal, Prisma-backed `LocalLLMConfig`, Ollama health/configuration endpoints, a unified LLM client that switches between DeepSeek and Ollama, and an offline dashboard guard when Ollama is required.
- Added an `/offline` download page plus homepage/dashboard/sidebar entry points for Windows and Linux desktop artifacts expected at `public/offline/windows-setup.exe` and `public/offline/doctor-vai.appimage`.
- Added offline runtime scaffolding: `OFFLINE=true` mode helpers, offline session fallback, Electron launcher files, PGlite socket-backed Prisma bootstrap, and offline migration wiring.
- Fixed an Edge runtime regression by moving Node-only DB path logic from `lib/env.ts` into `lib/env-node.ts`.

## Core Features

1.  **Treatment Guidance:** Interactive, animated step-by-step procedures categorized with visual cards and a checklist tracker sourced from `/lib/procedures.json`.
2.  **Medicine Interaction Warning:** Multi-input analysis (disease, symptoms, prescribed medicines) utilizing Deepseek to output verdict, explanation, and alternatives JSON via an intuitive modal.
3.  **Risk Detection:** Pre-treatment risk assessment based on age/symptoms to evaluate attention priority without definitive diagnosis.
4.  **Disease Detection:** Symptom-based diagnostic suggestion engine.
5.  **Vaccination Reminder:** Automated internal scheduling system applied during patient treatment workflows.
6.  **Assistant AI:** A private RAG-based chatbot interface interacting with uploaded local files.
7.  **Settings & Knowledge Upload:** Control center including file uploads for the private RAG system and Local AI connectivity setup.
8.  **Offline Distribution:** Public download page and Electron packaging flow for Windows/Linux desktop builds.

## Important File Roles

- `lib/llm-client.ts`: single switch point between DeepSeek and Ollama.
- `lib/db.ts`: single runtime DB bootstrap with offline/online branching.
- `lib/migrate-offline.ts`: offline Prisma migration runner used before Electron window load.
- `components/settings/connect-local-modal.tsx`: user flow for Cloudflared + Ollama setup.
- `components/offline/offline-mode-guard.tsx`: dashboard overlay when offline mode requires Local AI.
- `app/offline/page.tsx`: public download page for desktop artifacts.

## Offline Build Conventions

- Desktop binaries are expected at:
  - `public/offline/windows-setup.exe`
  - `public/offline/doctor-vai.appimage`
- The homepage, dashboard, and sidebar already link to `/offline`.
- `npm run build` still requires explicit permission per `AGENTS.md`.

## Known Follow-up Items

- ESLint still reports pre-existing unrelated issues in:
  - `app/(dashboard)/dashboard/ask-ai/page.tsx`
  - `app/api/reminders/[id]/complete/route.ts`
  - `app/docs/DocsClient.tsx`
  - `app/layout.tsx`
  - `components/dashboard-charts.tsx`
- Electron packaging scripts/config are present, but a real production packaging pass was not run because `npm run build` needs permission first.
- The current offline DB runtime uses `@electric-sql/pglite-socket` to expose a pg-compatible connection for Prisma.

## Env File:

DEEPSEEK_API_KEY="sk-dummy"
DATABASE_URL="neon db pooled"
DATABASE_URL_UNPOOLED="neondb non pooled"
OFFLINE="false"
