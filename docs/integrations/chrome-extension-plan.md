# Chrome Extension Integration Plan

This document outlines the proposed architecture, functionality, and development phases for the official Nova‑XFinity Chrome Extension. The extension serves as a lightweight AI assistant, enabling users to access Nova‑X tools directly from their browser.

## Purpose

The Chrome extension brings the power of Nova‑XFinity's AI ecosystem to any web page by offering contextual AI tools, instant content generation, and plugin integrations — without logging into the full platform.

Key objectives:

- Enable instant AI generation from any webpage  
- Seamlessly connect with Nova‑XFinity APIs  
- Provide secure session management via user tokens  
- Simplify interaction with WordPress, media, and prompt libraries  

## Key Features

| Feature                  | Description                                                  |
|--------------------------|--------------------------------------------------------------|
| Prompt Assistant         | Inject and execute AI prompts in any webpage context         |
| Clipboard Generator      | Auto-copy AI outputs (titles, meta tags, etc.)               |
| Content Summarizer       | Summarize selected text via AI                               |
| Voice-to-Text Input      | Use microphone to dictate prompts                            |
| Image Generator          | Create visuals from inside the popup                         |
| Token Usage Panel        | Show token usage and plan tier                               |
| WordPress Injector       | Push content to connected WordPress sites                    |
| Secure Session Handler   | API key validation and auto-expiry                           |

## Architecture Overview

- **Frontend:** Chrome Extension popup, content scripts, context menu  
- **Backend:** All operations routed through Nova‑XFinity API  
- **Storage:** `localStorage` for auth and usage data  
- **Security:** API key encrypted with local nonce  

## File Structure

```plaintext
chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── icons/
│   └── icon128.png
├── styles/
│   └── popup.css
├── utils/
│   └── auth.js
```

## Authentication

User must paste Nova‑XFinity API key into popup

Key stored locally with expiration after 7 days

No key = no access to any AI services

## WordPress Integration

Inject generated content into `/wp-admin/post-new.php`

Push images via `/assets/upload` endpoint

Token sync uses `/tokens/sync` endpoint

## Development Phases

| Phase | Goals | Status |
|-------|-------|--------|
| 1 | Prompt UI, clipboard, token usage | ✅ Complete |
| 2 | Summarizer, voice input, cloud image gen | 🚧 In Progress |
| 3 | WordPress sync, asset handling, UI polishing | ⏳ Planned |
| 4 | Advanced context menu tools and overlay assistants | 🧠 Drafting |

## Deployment

Deployed via Chrome Web Store

Signed and uploaded via Developer Dashboard

Extension ID assigned on publish

## Next Steps

- Finalize UI and icon set
- Test content scripts across major sites
- Validate session security and expiration
- Write Web Store privacy and permissions policy
