✅ Nova‑XFinity AI — Audit-Based Task List (January 2026)

This task list outlines all remaining steps derived from the full audit conducted on January 8, 2026. It is organized by system area and should be tracked throughout the development lifecycle.

🧩 1. GLOBAL BRAND ALIGNMENT

Task 1.1 — Rename all outdated references:

Replace all instances of Finity, finity_settings, finity-ai-seo-writer.php, etc., with Nova‑XFinity.

Update plugin file names, constants, and route names.

Task 1.2 — Update visual branding:

Integrate new logo across all app sections and WordPress plugin.

Replace favicon and web meta tags.

🧩 2. FRONTEND (React / Vite)

Task 2.1 — Split Media Hub into separate modules:

Image Generation

Image Editing & Enhancement

Video Generation

Task 2.2 — Improve UI/UX copy:

Rewrite headings, buttons, tooltips, modals, and error messages.

Task 2.3 — Standardize dark mode visuals:

Fix contrast issues and unify component themes.

Task 2.4 — Add onboarding descriptions/tooltips to each screen.

Task 2.5 — Remove deprecated or unused components.

🧩 3. BACKEND (Node.js / Express)

Task 3.1 — Move route files to feature-based folders.

Task 3.2 — Refactor API credential handling:

Migrate all tokens to .env and add validations.

Task 3.3 — Split geminiService.js into:

geminiWriterService.js

geminiMediaService.js

geminiSeoService.js

Task 3.4 — Finalize and document usage tracking system.

Task 3.5 — Remove all debug console.log(); add centralized logging middleware.

🧩 4. AUTH SERVICE (FastAPI)

Task 4.1 — Finalize Google & GitHub OAuth routes.

Task 4.2 — Clean up app.py:

Remove dev users, hardcoded secrets, and test values.

Task 4.3 — Ensure FastAPI sessions are bridged to Node backend.

Task 4.4 — Add proper error handling and secure headers.

🧩 5. WORDPRESS PLUGIN

Task 5.1 — Rename plugin and internal identifiers to Nova‑XFinity AI.

Task 5.2 — Build multi-step plugin setup wizard.

Task 5.3 — Implement token usage sync between WP and platform.

Task 5.4 — Match plugin admin UI styling to Nova platform branding.

🧩 6. DOCUMENTATION

Task 6.1 — Add missing files:

/docs/prompts/service-prompts.md

/docs/development/ui-context-map.md

Task 6.2 — Update existing:

setup.md, backend-architecture.md, and .env.example

Task 6.3 — Create mermaid architecture diagrams for:

Routing flow

Media pipelines

Provider integration

🧩 7. GENERAL SYSTEM CLEANUP

Task 7.1 — Rename localStorage key finity_settings → nova_xfinity_settings

Task 7.2 — Refactor error messages like Generation failed. to include context and resolution tips.

Task 7.3 — Audit all environment variable usage:

Ensure complete .env.example coverage

📁 Visual Identity Folder (NEW)

Create a new folder at:

/docs/brand-identity/

Contents:

nova-logo.svg

nova-logo-dark.svg

brand-guidelines.md

colors.md (Hex codes, gradients, usage)

fonts.md (Headers, body, system fonts)

🔄 Keep this document updated after each task is completed. This list is the single source of truth until final pre-launch audit.