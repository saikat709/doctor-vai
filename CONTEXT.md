# Project Context: Health Worker Assistant

## Project Overview

An AI-powered decision-support tool designed for frontline field health workers to improve public health delivery. The application focuses on usability in real-world, low-resource environments, practical medical guidance, and data privacy.

## Tech Stack

- **Frontend/Backend:** Next.js (App Router), Tailwind CSS, Shadcn/UI, Lucide React (Icons), Framer Motion (Animations).
- **Auth:** Auth.js (NextAuth v5 beta) with Prisma adapter and credentials flow placeholder.
- **AI/LLM:** Deepseek API (simulated or direct via SDK) / RAG system for private data.
- **Local Storage/State:** LocalStorage / React Context (optimized for offline-first capability where possible).

## Architecture & Layout

1.  **Landing Page:** Auth-aware root entry with a medical hero, offline/privacy/decision-support message pillars, and a prominent "Go to Dashboard" button.
2.  **Main Layout:** A responsive dashboard shell with a dark-slate left sidebar, active route highlighting, and a fixed bottom-right Ask AI FAB that opens a right-side drawer.
3.  **Data Sources:** Local files like `/lib/procedures.json` containing standardized medical guidance steps.
4.  **Risk Triage:** Guardrailed diagnostics payloads routed through `/api/diagnostics/risk`, returning only attentionLevel, metrics, and precautions arrays without definitive diagnosis.

## Status Updates

- Added Auth.js scaffolding, a protected `/dashboard/*` workspace shell, an auth-aware landing page that redirects signed-in users to `/dashboard/session`, an animated treatment guidance checklist driven by local procedure JSON, a DeepSeek-style medicine interaction API that returns verdict JSON, and a triage risk screen with guardrailed LLM prompting.

## Core Features

1.  **Treatment Guidance:** Interactive, animated step-by-step procedures categorized with visual cards and a checklist tracker sourced from `/lib/procedures.json`.
2.  **Medicine Interaction Warning:** Multi-input analysis (disease, symptoms, prescribed medicines) utilizing Deepseek to output verdict, explanation, and alternatives JSON via an intuitive modal.
3.  **Risk Detection:** Pre-treatment risk assessment based on age/symptoms to evaluate attention priority without definitive diagnosis.
4.  **Disease Detection:** Symptom-based diagnostic suggestion engine.
5.  **Vaccination Reminder:** Automated internal scheduling system applied during patient treatment workflows.
6.  **Assistant AI:** A private RAG-based chatbot interface interacting with uploaded local files.
7.  **Settings & Knowledge Upload:** Control center including file uploads for the private RAG system.

## Env File:

DEEPSEEK_API_KEY="sk-dummy"
DATABASE_URL="neon db pooled"
DATABASE_URL_UNPOOLED="neondb non pooled"
