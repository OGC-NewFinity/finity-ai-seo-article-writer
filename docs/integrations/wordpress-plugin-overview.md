# WordPress Plugin Overview

This document provides a complete technical and strategic overview of the official Nova‑XFinity WordPress plugin. It outlines the plugin’s role, key functionalities, integration pathways, and roadmap within the Nova‑XFinity ecosystem.

---

## 🔧 Purpose

The Nova‑XFinity plugin enables WordPress site owners to:

- Instantly generate full websites or landing pages using AI-powered blueprints
- Integrate with Nova‑X Architect and Scribe engines
- Access AI content, media generation, and plugin APIs from the WordPress admin panel
- Automate styling, layout, SEO, and deployment tasks

---

## 🧱 Core Features

| Feature                     | Description                                                                 |
|----------------------------|-----------------------------------------------------------------------------|
| AI Site Generator          | Builds entire WordPress sites based on user prompts                        |
| Scribe Assistant           | Drafts blog posts, pages, and metadata using GPT-4 agents                   |
| Layout Importer            | Injects pre-designed templates into the current theme                       |
| Token Manager              | Manages user token usage and access tier (Free, Pro, Enterprise)            |
| Nova‑X Cloud Sync          | Optional cloud backups, theme syncing, and component sharing                |
| Plugin API Key Auth        | Secure user authentication for accessing Nova‑X services                    |
| AI Assets Generator        | Generates featured images, banners, icons, and Open Graph visuals           |
| Shortcode + Block Support  | AI features can be injected via Gutenberg blocks or shortcodes             |

---

## 🧩 Architecture

The plugin is structured into modular services:

- `/admin/` — Plugin UI and settings panel
- `/includes/` — Backend logic, API calls, content filters
- `/rest/` — Custom REST endpoints for frontend ↔ AI communication
- `/templates/` — Default UI templates and rendered blocks
- `/assets/` — CSS, JS, icons, preloaders

Supports both **classic** and **block-based** WordPress themes.

---

## 🔐 Authentication

All plugin features require a valid API key retrieved from the user’s Nova‑XFinity dashboard. Keys are stored securely in WordPress options and verified before each request.

---

## 📦 Dependencies

| Dependency   | Purpose                                 |
|--------------|------------------------------------------|
| WP REST API  | Registers custom routes and endpoints    |
| WP Cron      | Handles background syncs and token checks|
| Options API  | Manages plugin settings + tokens         |
| Shortcodes API| Enables legacy theme support            |

No external libraries or frameworks required.

---

## 🚀 Usage Workflow

1. **Install Plugin:** Upload or install via WordPress admin.
2. **Enter API Key:** Authenticate with your Nova‑XFinity account.
3. **Choose Service:** Select AI generator (site, blog, media, etc.).
4. **Submit Prompt:** Define requirements using the AI prompt field.
5. **Publish or Sync:** Insert AI output into posts, pages, or templates.

---

## 🗺️ Roadmap

| Version | Target Features                                 | Status   |
|---------|--------------------------------------------------|----------|
| v1.0    | Core features, AI generation, API key auth       | ✅ Released |
| v1.1    | Token dashboard, theme sync, asset previews      | 🚧 In Progress |
| v1.2    | WP‑CLI support, AI Scheduler, language switcher  | ⏳ Planned |
| v2.0    | Multisite + Nova‑X Cloud deployment              | 🧠 Under Review |

---

## 📁 Related Docs

- `/docs/integrations/plugin-api-endpoints.md`  
- `/docs/development/deployment-process.md`  
- `/docs/design/ui-components.md`

---

## 📌 Next Steps

- Finalize `/plugin-api-endpoints.md` documentation  
- Add code snippets for each service handler  
- Prepare CLI usage guide (for v1.2)
