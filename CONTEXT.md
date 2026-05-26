# Project Context: Health Worker Assistant

## Project Overview
An AI-powered decision-support tool designed for frontline field health workers to improve public health delivery. The application focuses on usability in real-world, low-resource environments, practical medical guidance, and data privacy.

## Tech Stack
*   **Frontend/Backend:** Next.js (App Router), Tailwind CSS, Shadcn/UI, Lucide React (Icons), Framer Motion (Animations).
*   **AI/LLM:** Deepseek API (simulated or direct via SDK) / RAG system for private data.
*   **Local Storage/State:** LocalStorage / React Context (optimized for offline-first capability where possible).

## Architecture & Layout
1.  **Landing Page:** Hero section, feature highlights, and a prominent "Go to Dashboard" button (handling auth/protected states).
2.  **Main Layout:** A persistent left sidebar for navigation across core features, with a floating "Ask AI" chat icon available on all dashboard views.
3.  **Data Sources:** Local files like `/lib/procedures.json` containing standardized medical guidance steps.

## Core Features
1.  **Treatment Guidance:** Interactive, animated step-by-step procedures categorized with visual cards.
2.  **Medicine Interaction Warning:** Multi-input analysis (disease, symptoms, prescribed medicines) utilizing Deepseek to output risk verdicts via an intuitive modal.
3.  **Risk Detection:** Pre-treatment risk assessment based on age/symptoms to evaluate attention priority without definitive diagnosis.
4.  **Disease Detection:** Symptom-based diagnostic suggestion engine.
5.  **Vaccination Reminder:** Automated internal scheduling system applied during patient treatment workflows.
6.  **Assistant AI:** A private RAG-based chatbot interface interacting with uploaded local files.
7.  **Settings & Knowledge Upload:** Control center including file uploads for the private RAG system.


## Env File:
DEEPSEEK_API_KEY="sk-dummy"
DATABASE_URL="neon db pooled"
DATABASE_URL_UNPOOLED="neondb non pooled"