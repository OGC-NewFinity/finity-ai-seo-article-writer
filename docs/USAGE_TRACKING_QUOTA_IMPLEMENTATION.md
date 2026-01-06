# Usage Tracking & Quota Limits Implementation

This document describes the implementation of usage tracking and quota enforcement across the application.

## Overview

The quota system tracks user activity (article generations, image generations, research queries, etc.) and enforces limits based on subscription plans. Users are warned when they reach 90% of their quota and are blocked when they exceed it.

## Backend Implementation

### 1. Quota Middleware (`backend/src/middleware/quota.middleware.js`)

The `checkQuota` middleware factory creates middleware that validates quota before allowing feature usage:

```javascript
import { checkQuota } from '../middleware/quota.middleware.js';

// Protect an endpoint
router.post('/articles', checkQuota('articles'), async (req, res) => {
  // req.quota contains quota info
  // After successful generation, increment usage
  await incrementUsage(req.user.id, 'articlesGenerated', 1);
});
```

**Features:**
- Returns 403 with `QUOTA_EXCEEDED` error if quota is exceeded
- Attaches quota info to `req.quota` for use in route handlers
- Supports features: `articles`, `images`, `videos`, `research`, `wordpress`

### 2. Usage Service (`backend/src/services/usage.service.js`)

Handles usage tracking and quota checking:

- `getCurrentUsage(userId)` - Gets current period usage
- `incrementUsage(userId, feature, amount)` - Increments usage (throws if exceeded)
- `canPerformAction(userId, feature)` - Checks if action is allowed
- `getUsageStats(userId)` - Returns formatted usage statistics

### 3. Example Route Files

Example implementations showing quota middleware usage:

- `backend/src/routes/articles.routes.js` - Article generation with quota check
- `backend/src/routes/media.routes.js` - Image/video generation with quota check
- `backend/src/routes/research.routes.js` - Research queries with quota check

**Usage Pattern:**
```javascript
router.post('/endpoint', checkQuota('feature'), async (req, res) => {
  // Quota already checked, proceed with generation
  const result = await generateFeature();
  
  // Increment usage after successful generation
  await incrementUsage(req.user.id, 'featureGenerated', 1);
  
  res.json({ success: true, data: result });
});
```

## Frontend Implementation

### 1. Quota Utilities (`utils/quotaChecker.js`)

Helper functions for quota checking:

- `isQuotaWarning(used, limit)` - Checks if usage >= 90%
- `isQuotaExceeded(used, limit)` - Checks if quota exceeded
- `getUsagePercentage(used, limit)` - Calculates usage percentage
- `checkFeatureQuota(usageStats, feature)` - Comprehensive quota check
- `getQuotaWarningMessage(quotaCheck, featureName)` - Gets warning message

### 2. useQuota Hook (`hooks/useQuota.js`)

React hook for quota checking:

```javascript
import { useQuota } from '../hooks/useQuota.js';

const { usage, loading, checkQuota, refresh } = useQuota();
const articlesQuota = checkQuota('articles');
```

### 3. QuotaGuard Component (`components/common/QuotaGuard.js`)

Wraps buttons/actions and enforces quota:

```javascript
import QuotaGuard from '../components/common/QuotaGuard.js';

<QuotaGuard feature="articles" featureName="Articles">
  <button onClick={handleGenerate}>
    Generate Article
  </button>
</QuotaGuard>
```

**Features:**
- Automatically disables button when quota exceeded
- Shows warning message when quota >= 90%
- Blocks click events when quota exceeded
- Shows alert with upgrade message

### 4. Subscription Page Warnings (`pages/Subscription.js`)

The subscription page automatically shows warning banners when any feature reaches 90% quota:

- Red banner if quota exceeded
- Amber banner if quota >= 90%
- Shows upgrade button
- Lists all features with warnings

## Feature Limits by Plan

Defined in `backend/src/utils/featureFlags.js`:

| Feature | FREE | PRO | ENTERPRISE |
|--------|------|-----|------------|
| Articles | 10/month | 100/month | Unlimited |
| Images | 25/month | 500/month | Unlimited |
| Videos | 0 | 20/month | 100/month |
| Research | 20/month | Unlimited | Unlimited |
| WordPress | 0 | 50/month | Unlimited |

## API Endpoints

### Get Usage Stats
```
GET /api/subscription/usage
```
Returns current usage for all features.

### Get Limits
```
GET /api/subscription/limits
```
Returns plan limits for all features.

### Quota Exceeded Response
When quota is exceeded, endpoints return:
```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "You have reached your articles quota limit...",
    "details": {
      "feature": "articles",
      "currentUsage": 10,
      "limit": 10,
      "plan": "FREE"
    }
  }
}
```

## Usage Flow

1. **User Action**: User clicks "Generate Article"
2. **Frontend Check**: `QuotaGuard` checks quota via `useQuota` hook
3. **Button State**: Button disabled if quota exceeded, shows warning if >= 90%
4. **API Request**: Request sent to backend
5. **Backend Check**: `checkQuota` middleware validates quota
6. **Response**: 
   - If allowed: Generation proceeds, usage incremented
   - If exceeded: 403 error returned
7. **Frontend Handling**: Error displayed, upgrade prompt shown

## Integration Examples

### Protecting Article Generation Button

```javascript
import QuotaGuard from '../components/common/QuotaGuard.js';

<QuotaGuard feature="articles" featureName="Articles">
  <button 
    onClick={handleGenerate}
    className="generate-button"
  >
    Generate Article
  </button>
</QuotaGuard>
```

### Manual Quota Check

```javascript
import { useQuota } from '../hooks/useQuota.js';

const { checkQuota } = useQuota();

const handleGenerate = () => {
  const quota = checkQuota('articles');
  if (!quota.allowed) {
    alert('Quota exceeded!');
    return;
  }
  // Proceed with generation
};
```

### Backend Route Protection

```javascript
import { checkQuota } from '../middleware/quota.middleware.js';
import { incrementUsage } from '../services/usage.service.js';

router.post('/generate', checkQuota('articles'), async (req, res) => {
  const article = await generateArticle();
  await incrementUsage(req.user.id, 'articlesGenerated', 1);
  res.json({ success: true, data: article });
});
```

## Testing

1. **Test Quota Warnings**: Use a FREE plan and generate 9 articles (90% of 10)
2. **Test Quota Blocking**: Generate 10 articles (100% of FREE plan)
3. **Test Upgrade Flow**: Click upgrade button from warning banner
4. **Test Backend Enforcement**: Make API request when quota exceeded

## Notes

- Usage resets monthly (handled by `resetMonthlyUsage` function)
- Unlimited features (-1 limit) always pass quota checks
- Quota checks are performed before generation, not after
- Usage is only incremented after successful generation
- Frontend warnings are advisory; backend enforcement is authoritative
