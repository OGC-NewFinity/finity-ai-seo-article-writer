# Common Issues & Fixes

This document provides a categorized list of frequently encountered issues within the Nova‑XFinity ecosystem. Use this as a reference before submitting a new bug report.

---

## 🔐 Authentication Issues

### API Key Not Accepted

**Symptom:**  
> API key entered in plugin or extension is rejected.

**Cause:**  
- Invalid or expired key  
- Typo during copy-paste  
- Token limit reached

**Fix:**  
- Regenerate key from dashboard  
- Re-authenticate and try again  
- Contact support if limits are exceeded

---

### Session Expired

**Symptom:**  
> Logged-in session stops responding or auto-logs out.

**Cause:**  
- API session timeout (default: 7 days)
- Browser storage cleared

**Fix:**  
- Re-enter API key  
- Refresh token via profile settings

---

## 🧠 AI Generation Errors

### Prompt Timeout or Failure

**Symptom:**  
> AI tools fail to return results, spinner runs indefinitely.

**Cause:**  
- Prompt too long  
- Service rate-limited  
- Backend connection timeout

**Fix:**  
- Shorten the prompt  
- Wait and retry  
- Check API status page

---

### Invalid Image Response

**Symptom:**  
> Image generation returns a broken link or 500 error.

**Cause:**  
- Unsupported style or ratio  
- Model capacity exceeded

**Fix:**  
- Switch style or reduce intensity  
- Retry after cooldown

---

## 🌐 WordPress Plugin Issues

### Content Not Syncing

**Symptom:**  
> AI-generated content doesn't appear in WP editor.

**Cause:**  
- JS conflict with other plugins  
- Invalid API key  
- REST endpoint blocked

**Fix:**  
- Clear cache and try again  
- Test on default theme  
- Enable WP_DEBUG and check logs

---

### Settings Not Saving

**Symptom:**  
> Plugin settings revert after page reload.

**Cause:**  
- Permissions issue  
- Server doesn't support `options.php`

**Fix:**  
- Update WordPress  
- Manually save via `/wp-admin/options.php`

---

## 🧩 Chrome Extension Issues

### Popup Not Loading

**Symptom:**  
> Blank popup or UI freeze.

**Cause:**  
- Extension update failed  
- Blocked local storage

**Fix:**  
- Reinstall the extension  
- Reset Chrome sync settings

---

## 📦 Deployment Conflicts

### Build Fails (Vite/Node)

**Symptom:**  
> App doesn't compile during local or Docker build.

**Cause:**  
- Outdated dependencies  
- Missing `.env` variables

**Fix:**  
- Run `npm install`  
- Check `env.example` for required vars

---

## 📌 Notes

- Check the [Error Report Template](./error-report-template.md) for structured reporting  
- All critical issues are logged under `OAUTH_FIXES_MASTER_LOG.md`  
- Contact support for persistent failures
