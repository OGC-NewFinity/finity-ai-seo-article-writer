# Nova‑XFinity AI Article Writer - WordPress Plugin

This WordPress plugin integrates the Nova‑XFinity AI Article Writer React application into your WordPress admin dashboard.

## Installation

1. **Copy the plugin folder** to your WordPress plugins directory:
   ```
   wp-content/plugins/finity-ai-seo-writer/
   ```

2. **Activate the plugin** in WordPress Admin → Plugins

3. **Configure the app URL** (if different from default):
   - Go to Settings → Nova‑XFinity AI
   - Set the App URL (default: http://localhost:3000)

## Usage

1. Navigate to **Nova‑XFinity AI** in WordPress admin menu
2. The React app will load in an iframe
3. Generate articles using the Nova‑XFinity AI interface
4. Publish directly to WordPress as drafts

## REST API Endpoints

- `POST /wp-json/finity-ai/v1/publish` - Publish article to WordPress
- `GET /wp-json/finity-ai/v1/status` - Get plugin status

## Local WordPress Development

For **Local by Flywheel** or similar:

1. Set App URL to: `http://localhost:3000` (or your Vite dev server URL)
2. Ensure CORS is configured in Vite config
3. WordPress REST API must be enabled (default in WordPress 5.0+)

## Requirements

- WordPress 5.0+
- PHP 7.4+
- React app running on http://localhost:3000
