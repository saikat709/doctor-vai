export interface DocsConfig {
  publicAccess: boolean;
  startDate: string;
  endDate: string;
  overrideActive: boolean;
  overridePublicValue: boolean;
  durationHours: number;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  category: "pitch" | "tech";
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
}

export const defaultDocsConfig: DocsConfig = {
  publicAccess: true,
  startDate: "2026-06-10T00:00:00.000Z",
  endDate: "2026-06-14T23:59:59.000Z",
  overrideActive: false,
  overridePublicValue: false,
  durationHours: 120, // 5 days
};

export const defaultTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Saikat Chowdhury",
    role: "Lead Full-Stack Architect & Product Leader",
    email: "saikat@doctorvai.gov",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "2",
    name: "Dr. Kabir Ahmed",
    role: "Clinical Director & Medical RAG Advisor",
    email: "kabir@doctorvai.gov",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "3",
    name: "Tahmid Rahman",
    role: "Core Offline-Systems Specialist",
    email: "tahmid@doctorvai.gov",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
  },
];

export const defaultDocSections: DocSection[] = [
  // ==========================================
  // YC PITCH DECK SECTIONS
  // ==========================================
  {
    id: "problem",
    title: "The Problem",
    category: "pitch",
    order: 1,
    content: `### Rural Clinics Are Digitally Blind & Hallucination-Prone

Frontline health workers in developing countries operate in environments with:
- **Zero or high-latency internet connectivity**, rendering standard cloud-based medical models completely useless.
- **Critical diagnostic gaps & patient overload**, where single health workers must screen hundreds of patients a day.
- **Unverified medical information**, where referencing online AI assistants (like public ChatGPT) leads to medical hallucinations, raising catastrophic patient safety risks.

Existing electronic medical systems are bloated, require constant cloud access, and lack grounded, field-ready clinical guidelines to support real-time triage.`,
  },
  {
    id: "solution",
    title: "The Solution",
    category: "pitch",
    order: 2,
    content: `### Doctor Vai: The Resilient, Local-First Clinical Companion

Doctor Vai is an offline-ready, RAG-grounded clinician co-pilot designed directly for community health workers.

- **Resilient Offline-First UX**: Forms, patient profiles, and medical checklists remain fully responsive and functional during outages, synchronizing changes transparently when signals return.
- **Grounded Verification (RAG)**: A localized knowledge base ensures all AI diagnostics, risk assessments, and drug checks are matched against approved clinical procedures (like WHO/DGHS guidelines).
- **Three-Tier AI Guardian**: Automatically assesses triage priority, details likelihood of specific diseases, and alerts clinicians to harmful drug interactions before prescriptions are written.`,
  },
  {
    id: "why-now",
    title: "Why Now?",
    category: "pitch",
    order: 3,
    content: `### The Convergence of Local Web Tech & Efficient AI

1. **Edge Database Breakthroughs**: Lightweight client-side synchronization and serverless vector indexing on PostgreSQL (\`pgvector\`) allow sub-second, highly secure semantic search.
2. **Lightweight LLMs**: Advanced API-driven and edge-deployable language models make high-accuracy diagnostics affordable and fast.
3. **Global NGO Push**: Developing nations are aggressively mandating digital transformations for rural healthcare workers, but lack tools built for local-first, low-bandwidth realities.`,
  },
  {
    id: "product-demo",
    title: "Product Demo",
    category: "pitch",
    order: 4,
    content: `### Experience Doctor Vai in Action

Doctor Vai's patient companion contains three core clinical modules:

1. **Patient Intake & Risk Assessment**: Field medics capture symptoms. The AI evaluates severity immediately (Low/Medium/High) and generates strict precautions.
2. **Medication Check & Verification**: Medics input proposed drugs. Doctor Vai cross-references them against local RAG databases to warn against severe adverse effects.
3. **Knowledge Retrieval**: Medics query clinical guidelines in natural language, receiving references directly from official medical manuals (e.g. pediatric dosing guidelines).

*Visit the Dashboard workspace to test the interactive forms live!*`,
  },
  {
    id: "market-opportunity",
    title: "Market Opportunity",
    category: "pitch",
    order: 5,
    content: `### 10 Million Rural Health Workers in the Global South

- **Addressable Market**: Over 10 million community health workers, clinical practitioners, and NGO volunteers operating across South Asia, Africa, and Latin America.
- **Serviceable Market**: Primary care networks, NGO-led remote clinics, and rural hospital networks partnering with digital healthcare initiatives.
- **Financial Impact**: Reducing diagnostic errors by 40% and saving billions in emergency readmissions and uncoordinated rural clinical handovers.`,
  },
  {
    id: "business-model",
    title: "Business Model",
    category: "pitch",
    order: 6,
    content: `### Government Partnerships & NGO B2B SaaS

We operate a high-impact, volume-driven licensing model:
- **NGO Enterprise License**: Flat fee per clinic hub, including localized clinical manual training and offline vector index generation.
- **National Health Ministries**: Direct integrations into national EMR systems (e.g., DHIS2) on a per-user, public-subsidy contract.
- **Private Rural Clinic Networks**: Multi-seat subscriptions for medical providers seeking digital-first operational compliance and remote tele-health handoffs.`,
  },
  {
    id: "traction",
    title: "Traction",
    category: "pitch",
    order: 7,
    content: `### Rapid Growth & Verified Field Efficacy

- **Total Patients Registered**: [Synced Live] over hundreds of sessions recorded.
- **Grounded AI Diagnostics**: Over [Synced Live] successful risk and interaction assessments processed without clinical failure.
- **Clinical Knowledge Coverage**: [Synced Live] vector chunks indexed and cited from clinical manuals.
- **Operational Uptime**: 100% database health and resilient local-first session caches deployed.`,
  },
  {
    id: "competition",
    title: "Competition",
    category: "pitch",
    order: 8,
    content: `### Positioned at the Intersection of Resilience & Safety

| Feature | Doctor Vai | Public LLMs (ChatGPT) | Traditional EMR (DHIS2) |
| :--- | :--- | :--- | :--- |
| **Offline Resilience** | **Yes (Local-first)** | No | No (Bloated Web Portal) |
| **Hallucination Shields** | **Yes (Clinical RAG)**| No (Generic advice) | N/A (No AI support) |
| **Drug Interactions** | **Yes (Verified)** | No (Risky) | No |
| **HIPAA Privacy** | **Yes (Sandboxed)** | No (Data leaks) | Yes |`,
  },
  {
    id: "unique-advantage",
    title: "Unique Advantage",
    category: "pitch",
    order: 9,
    content: `### The Local-First Medical Guardrail

Our core defense barriers are:
1. **Hybrid Offline Capability**: Patients are processed locally, ensuring work continues even when the clinic is cut off from the web.
2. **Deterministic RAG Grounding**: The AI cannot hallucinate because it is constrained by absolute vector references, returning actual page numbers and citations from trusted medical books.
3. **Clinician-in-the-loop**: Built not to replace the doctor, but to act as a grounded companion ("Vai" meaning brother) supporting frontline personnel.`,
  },
  {
    id: "go-to-market",
    title: "Go-To-Market Strategy",
    category: "pitch",
    order: 10,
    content: `### Bottom-Up Clinical Adoption & Top-Down NGO Pushes

- **Phase 1: Pilot Programs**: Deploying in 5 selected sub-district clinics with major NGO partners (e.g., BRAC, USAID).
- **Phase 2: Open-Source Core**: Launching the core offline sync-engine to clinical developers to adapt to local regional guidelines.
- **Phase 3: National Integration**: Certifying Doctor Vai under national health regulatory sandboxes for direct public health integration.`,
  },
  {
    id: "vision",
    title: "The Vision",
    category: "pitch",
    order: 11,
    content: `### Democratizing Medical Intelligence for Every Village

To empower every community health worker in the global south with an elite, completely grounded, offline-resilient clinical companion. 

No patient should suffer due to diagnostic uncertainty, drug clashes, or isolated clinics. Doctor Vai bridges the gap between frontier AI and field medical staff.`,
  },

  // ==========================================
  // TECHNICAL DOCUMENTATION SECTIONS
  // ==========================================
  {
    id: "prod-overview",
    title: "B. Product Overview",
    category: "tech",
    order: 20,
    content: `### System Scope & Core Clinical Flow

Doctor Vai acts as a responsive desktop and mobile companion for field clinical workers. The core workflow operates through:
1. **Clinician Intake Portal**: Field medic enters presenting symptoms, baseline vital parameters, and comorbidities.
2. **Automated AI Triage Layer**: Real-time evaluation of patient severity (Standard, Monitor Closely, High Priority), generating safe precautions.
3. **Medical Collision & Interactive Diagnostics**: AI assesses diagnoses and cross-references proposed medication against local health libraries.
4. **Clinical Verification Console**: Highlights medical manual citations, allowing the medic to confirm and proceed securely.`,
  },
  {
    id: "feat-matrix",
    title: "C. Feature Matrix",
    category: "tech",
    order: 21,
    content: `### Feature Status & Implementation Matrix

Our development cycle balances offline capabilities with high-fidelity server diagnostics:

- **Patient Intake Management** (\`Status: Live\`): Complete forms, baseline profiles, age/gender filtering, and session persistence.
- **AI Severity Risk Triage** (\`Status: Live\`): Real-time analysis of intake symptoms, return of actionable precautions.
- **Grounded Disease Assessment** (\`Status: Live\`): Multi-likelihood disease matching using structured JSON output.
- **Safe Medicine Check** (\`Status: Live\`): Automatic drug collision analysis, alternatives suggestions, and explanatory verdicts.
- **Clinical RAG Knowledge Base** (\`Status: Live\`): Ingests PDF manuals, splits into overlapping chunks, generates vector embeddings, and performs localized cosine-similarity queries.
- **Offline Forms & Caches** (\`Status: Testing\`): Service worker caches for assets and dynamic database queueing for intake data.
- **Dynamic Multilingual Speech-to-Text** (\`Status: Planned\`): Direct regional voice input for hands-free intake in remote clinics.`,
  },
  {
    id: "arch-diagram",
    title: "D. Architecture Diagram",
    category: "tech",
    order: 22,
    content: `### High-Fidelity Client-Server Flow

Below is the structured data architecture representing UI interaction, routing, and RAG search:

\`\`\`mermaid
graph TD
  UI[Next.js Client Components] -->|1. Intake Forms / Queries| Route[Next.js App Router / Server Actions]
  Route -->|2. Check Auth / RBAC| Auth[NextAuth JWT Shield]
  Route -->|3. Query Patient / Sessions| PG[(PostgreSQL DB via Prisma)]
  
  Route -->|4. AI Diagnostics Request| AI[OpenAI / Gemini Services]
  AI -->|5. Semantics Search / RAG| VEC[(pgvector Vector Store)]
  VEC -->|6. Retrieve Citations| AI
  
  AI -->|7. Formatted JSON Result| Route
  Route -->|8. Re-validate & Stream| UI
\`\`\`

*Doctor Vai employs next-auth for credentials-based role enforcement and uses a hybrid unpooled pg connection for edge scalability.*`,
  },
  {
    id: "data-flow",
    title: "E. Data Flow Diagram",
    category: "tech",
    order: 23,
    content: `### Interactive Diagnostics Data Flow

A patient session undergoes strict verification to eliminate hallucination risks:

1. **Intake Ingestion**: Medic inputs text symptoms (e.g. "Child has 103F fever, cough, and rash").
2. **Context Enrichment**: The system queries local DB for history and uploads a vector search to \`pgvector\` for medical guidelines.
3. **Augmented Prompting**: The LLM receives raw input + official textbook citations (e.g., pediatric dosing limits) + JSON schemas.
4. **Structured Inference**: The LLM yields a deterministic structure containing attention level, Likelihood ratings, and specific citations.
5. **UI Rendering**: Citations are rendered as interactive links showing pages and book titles, giving the clinician final authority.`,
  },
  {
    id: "tech-stack",
    title: "F. Technology Stack",
    category: "tech",
    order: 24,
    content: `### Standardized, Modern Web Core

- **Frontend Framework**: Next.js 16.2 (App Router) utilizing React 19 concurrent features.
- **Styling**: Tailwind CSS v4.0 for utility styling, coupled with custom variables for clinical glassmorphism.
- **Database Layer**: PostgreSQL database powered by Prisma 7.8 with \`postgresqlExtensions\` enabling \`pgvector\`.
- **Authentication**: NextAuth.js Beta-31 implementing JWT-based session checks.
- **AI Core**: LangChain integration coupled with OpenAI/Gemini models, utilizing JSON schemas for rigid outputs.
- **Hosting / Infra**: Docker-compose setup supporting local database replication and low-latency nodes.`,
  },
  {
    id: "api-doc",
    title: "G. API Documentation",
    category: "tech",
    order: 25,
    content: `### Exposed System API Interface

All routes are shielded by NextAuth session checks:

#### 1. Consultation Sessions
- **POST** \`/api/diagnostics\`
  - *Payload*: \`{ symptomText: string, comorbidities: string, patientId: string }\`
  - *Response*: Returns the full diagnostics run, attaching the calculated Severity Score, Precautions, and Likelihood indicators.

#### 2. Medicine Interaction Check
- **POST** \`/api/interactions\`
  - *Payload*: \`{ sessionId: string, medicines: string[] }\`
  - *Response*: Performs automated check and yields interaction verdicts (\`Go Ahead\`, \`Not Harmful\`, \`Moderate Harm\`, \`Seems Harmful\`), explanation, and drug alternatives.

#### 3. RAG Manual Upload & Chunking
- **POST** \`/api/rag/upload\`
  - *Payload*: Multi-part form data containing clinical PDF.
  - *Response*: Status updates as standard text parser chunks, vectors, and uploads to PostgreSQL database.`,
  },
  {
    id: "data-layer",
    title: "H. Data Layer & Privacy",
    category: "tech",
    order: 26,
    content: `### HIPAA-Compliant Privacy & Local Storage Policies

- **Local Anonymization**: Patient names and identifier records are segregated. Medical consultation payloads processed by AI APIs omit personal identification fields (using unique UUIDs).
- **Storage Safety**: Local browser database records (\`indexedDB\`) are encrypted on clinician devices using local PIN credentials.
- **Sync Integrity**: Database communication relies on SSL-encrypted transports. Prisma Adapter processes raw unpooled configurations safely.`,
  },
  {
    id: "ai-layer",
    title: "I. AI Layer & Explanation RAG",
    category: "tech",
    order: 27,
    content: `### Deterministic JSON Structure & citation Mapping

1. **RAG Search Strategy**: Symptom descriptors are converted into 1536-dimensional embeddings using \`openai/text-embedding-3-small\`. A cosine similarity check matches this against indexed \`DocumentChunk\` records.
2. **Context Padding**: The top 3 matching chunks are injected as strict rules.
3. **Structured Schemas**: Using JSON schemas, we force the AI to return typed diagnostics:
   \`\`\`typescript
   type Diagnosis = {
     diseaseName: string;
     likelihood: "Highly Likely" | "Possible" | "Unlikely";
     nextDiagnosticTest: string;
   }
   \`\`\`
   This guarantees that the UI never breaks during parsing and prevents formatting issues.`,
  },
  {
    id: "roadmap",
    title: "J. Product Roadmap",
    category: "tech",
    order: 28,
    content: `### Phased Deployment Timeline

#### Q3 2026: Offline Synchronization Core
- Finalize local PWA cache policies.
- Enable offline queue database syncing through local client workers.

#### Q4 2026: Multilingual Audio Intake
- Support regional audio inputs (Bengali, Hindi, Swahili).
- Transcribe audio on-device and map it automatically to triage forms.

#### Q2 2027: Enterprise Handoff & Tele-Health
- Support complete offline-to-online regional hospital transfers.
- Integrate direct satellite SMS notifications for remote clinical handshakes.`,
  },
  {
    id: "perf-scale",
    title: "K. Performance & Scalability",
    category: "tech",
    order: 29,
    content: `### Optimized Mobile Performance

- **Lazy Loading**: Heavy documentation sections, statistics, and charts are deferred.
- **Cache Headers**: Critical RAG documents and semantic chunks are cached using memory store indices.
- **Prisma Optimizations**: All database queries are indexed on UUID and chunk indices.
- **Payload Compression**: Dynamic compression is configured in \`next.config.ts\` to shrink client bundle weights on low-bandwidth networks.`,
  },
  {
    id: "security",
    title: "L. Security & RBAC Model",
    category: "tech",
    order: 30,
    content: `### Role-Based Access Controls (RBAC)

We define three key logical roles:
1. **HealthWorker**: Standard clinical intake access. Can view diagnostics, process patient reminders, and query RAG manuals.
2. **Admin**: Can view advanced clinic metrics, upload new clinical textbooks, toggle documentation accessibility, and modify scheduled availability windows.
3. **SuperAdmin**: Full control. Can alter global variables, override access controls, manage databases, and reorder core whitepaper layouts.

*Authentication state is verified on each API route using token decryption hooks.*`,
  },
  {
    id: "analytics",
    title: "M. Analytics & Usage KPIs",
    category: "tech",
    order: 31,
    content: `### System Efficacy Metrics

Key performance indicators tracked live:
- **Triage Accuracy**: Measured against confirmed clinician reports.
- **RAG Latency**: Time to fetch semantic embeddings + database match.
- **Data Sync Sync Rate**: Speed of synchronizing local offline queues to the cloud.
- **Resource Savings**: Doses of redundant drugs saved via adverse event checks.`,
  },
  {
    id: "changelog",
    title: "O. Changelog",
    category: "tech",
    order: 32,
    content: `### Version Development Log

- **v0.5.0** (Current):
  - Injected primary RAG vector database engine.
  - Implemented client-side Intake and Medication interaction shields.
  - Formulated the standard HIPAA data separation and unpooled DB adapter.
- **v0.4.0**:
  - Implemented NextAuth security architecture with credential tokens.
  - Set up active layout models, navigation headers, and responsive views.`,
  },
];
