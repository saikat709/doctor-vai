# Project TODO List

- [ ] TODO 1: Project Initialization & Theme Setup
- [ ] TODO 2: Core Layout & Navigation (Sidebar + Floating AI Button)
- [ ] TODO 3: Landing Page Implementation
- [ ] TODO 4: Treatment Guidance Feature (JSON integration)
- [ ] TODO 5: Medicine Interaction Warning System (Deepseek Integration)
- [ ] TODO 6: Risk Detection Interface (Pre-treatment screening)
- [ ] TODO 7: Symptom-Based Disease Detection Module
- [ ] TODO 8: Vaccination Reminder Tracking System
- [ ] TODO 9: Settings Panel & Knowledge Base File Upload System
- [ ] TODO 10: RAG-Based Assistant AI Chat Interface
- [ ] TODO 11: Offline-First Reliability & Final Polish


### TODO 9: Settings Panel & Knowledge Base File Upload System
*   **Task:** Build a settings configurations page with a file uploader zone for local RAG documents.
*   **Prompt for Copilot:**
    > "Create the Settings page. Include layout configurations for offline mode storage limits and profile settings. Crucially, add a 'Knowledge Base Vector Upload' area. Create a drag-and-drop file upload zone accepting PDF, TXT, and Markdown files. Write frontend mock handlers that accept these files, store metadata, and simulate embedding preparation for a local RAG vector system. Update CONTEXT.md and mark TODO 9 as complete in TODO.md."

### TODO 10: RAG-Based Assistant AI Chat Interface
*   **Task:** Build the interactive Chatbot pane tied into the global floating button and uploaded knowledge.
*   **Prompt for Copilot:**
    > "Implement the RAG Assistant AI chat drawer/view. It must feature a clean scrollable chat history UI mimicking medical chat layouts. Provide pre-configured prompt chips at the top (e.g., 'Review local clinical guidelines'). The system must mock/stream answers sourced from the user files uploaded in Settings using a local Deepseek inference context. Ensure code allows message history persistence across sessions. Update CONTEXT.md and mark TODO 10 as complete in TODO.md."

### TODO 11: Offline-First Reliability & Final Polish
*   **Task:** Implement localStorage fallback mechanisms and performance checks for low-connectivity environments.
*   **Prompt for Copilot:**
    > "Conduct a full application review. Wrap all API requests with elegant fallback states to pull from localStorage or cache if the network drops out. Ensure every form has complete validation states, skeleton loaders for slow network connections, and clear error notifications via Shadcn Toasts. Update CONTEXT.md and mark TODO 11 as complete in TODO.md."