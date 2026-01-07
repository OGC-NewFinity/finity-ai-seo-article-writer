# Plugin API Endpoints

This document outlines all custom API endpoints registered by the Nova‑XFinity WordPress plugin. These endpoints connect the WordPress interface to external Nova‑X services and internal plugin logic, enabling real-time AI generation, content sync, and authentication workflows.

## 🌐 Base Namespace

All endpoints are registered under:

```
/wp-json/nxf/v1/
```

## 🔐 Authentication

API requests require a valid API key passed via:

- Header: `Authorization: Bearer YOUR_API_KEY`  
- Query (fallback): `?api_key=YOUR_API_KEY`  

## 📊 Endpoint Index

| Endpoint                      | Method | Description                                |
|-------------------------------|--------|--------------------------------------------|
| `/status`                    | GET    | Health check and plugin info               |
| `/auth/validate`             | POST   | Validates and stores API key               |
| `/ai/generate/site`          | POST   | Builds a complete site via AI              |
| `/ai/generate/content`       | POST   | Generates page/post content                |
| `/ai/generate/image`         | POST   | Creates media assets via AI                |
| `/assets/upload`             | POST   | Uploads files to WP Media Library          |
| `/settings/get`              | GET    | Fetches plugin config                      |
| `/settings/update`           | POST   | Updates plugin settings                    |
| `/tokens/sync`               | POST   | Syncs token usage and plan info            |

## 🧠 Example — `/auth/validate`

**Method:** POST  
**Payload:**
```json
{
  "api_key": "YOUR_API_KEY"
}
```

**Response:**
```json
{
  "valid": true,
  "plan": "Pro",
  "remaining_tokens": 7820
}
```

## ✍️ Example — `/ai/generate/content`

**Method:** POST  
**Payload:**
```json
{
  "prompt": "Write a landing page for an AI assistant.",
  "tone": "professional",
  "format": "html"
}
```

**Response:**
```json
{
  "html": "<section><h1>Nova‑X Assistant</h1>...</section>"
}
```

## 🖼️ Example — `/ai/generate/image`

**Method:** POST  
**Payload:**
```json
{
  "prompt": "Futuristic control panel interface",
  "style": "plasma",
  "aspect_ratio": "16:9"
}
```

**Response:**
```json
{
  "image_url": "https://cdn.nova-x.ai/generated/5123.png"
}
```

## ⚙️ Settings: `/settings/get` & `/settings/update`

Used for retrieving and modifying plugin settings stored in the WordPress DB.

## 🗃️ File Upload: `/assets/upload`

Upload AI-generated images to the WordPress Media Library using multipart/form-data. Response includes media ID and URL.

## 🔁 Token Sync: `/tokens/sync`

Used to keep the WordPress plugin in sync with the user's current token balance and plan metadata.

## 🧩 Notes

- All endpoints use WP REST API internal routing
- JSON only; form-encoded or XML requests are rejected
- Error codes follow standard WP REST conventions

## 📌 Next Steps

- Add CLI endpoint extensions (planned for v1.2)
- Create test coverage for `/ai/` endpoints
- Link to feature modules in `/admin/` and `/rest/`
