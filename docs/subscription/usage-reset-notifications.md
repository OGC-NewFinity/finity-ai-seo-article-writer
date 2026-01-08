# Usage Reset & Notifications System

**Description:** Documents the automatic monthly usage reset system and quota notification system for Nova‑XFinity AI.  
**Last Updated:** 2026-01-07  
**Status:** Stable

---

## Overview

Nova‑XFinity AI implements an automated system for monthly quota resets and quota notifications. The system automatically resets user quotas at the beginning of each billing period and sends notifications when users approach (80%) or exceed (100%) their quota limits.

### Key Components

- **Cron Job System** (`backend/src/jobs/`) - Automated scheduled tasks
- **Usage Service** (`backend/src/services/usage.service.js`) - Quota tracking and reset logic
- **Notification Service** (`backend/src/services/notification.service.js`) - Quota warning notifications
- **Email Service** (`backend/src/services/email.service.js`) - Email delivery via Resend
- **Token Usage Integration** - Integrates with TokenUsage model for token quota tracking

---

## Monthly Usage Reset

### Automatic Reset Schedule

The system automatically resets all user quotas at **00:00 UTC on the 1st day of each month**.

**Cron Schedule:** `0 0 1 * *` (minute hour day month day-of-week)

### Reset Process

1. **Find Expired Usage Records**
   - Identifies all usage records where `periodEnd < currentMonthStart`
   - Includes users with their subscription information

2. **Create New Usage Records**
   - Creates new `Usage` records for the current billing period
   - Sets `periodStart` to the 1st of the current month
   - Sets `periodEnd` to the last day of the current month

3. **Token Usage Handling**
   - Token usage resets are implicit (based on `createdAt` date)
   - Old token usage records are retained for historical analytics
   - Token quota calculations use the current month's `createdAt` filter

4. **Send Reset Notifications** (Optional)
   - If `SEND_QUOTA_RESET_EMAILS !== 'false'`, sends email notification to each user
   - Notifies users that their quota has been reset
   - Can be disabled to reduce email volume

### Implementation

```javascript
// backend/src/jobs/usageReset.job.js
import cron from 'node-cron';
import { resetMonthlyUsage } from '../services/usage.service.js';

cron.schedule('0 0 1 * *', async () => {
  await resetMonthlyUsage();
}, { scheduled: true, timezone: 'UTC' });
```

### Manual Trigger

For testing or manual execution:

```javascript
import { triggerUsageReset } from './jobs/usageReset.job.js';
const result = await triggerUsageReset();
```

Or via environment variable (for testing):
```bash
RUN_USAGE_RESET_ON_STARTUP=true npm start
```

---

## Quota Notifications

### Notification Thresholds

The system sends notifications at two thresholds:

- **80% Warning** - User has used 80% or more of their quota
- **100% Exceeded** - User has reached or exceeded their quota limit

### Notification Types

#### 1. Email Notifications

**80% Warning Email:**
- Subject: "Quota Warning: X% of Your [Feature] Limit Used"
- Includes usage summary and visual progress bar
- Provides link to subscription/usage page
- Reminds users that quota resets monthly

**100% Exceeded Email:**
- Subject: "Action Required: [Feature] Quota Exceeded"
- Critical notification that quota is exhausted
- Explains that feature is temporarily disabled
- Provides upgrade and account management links

**Quota Reset Email:**
- Subject: "Your Monthly Quota Has Been Reset"
- Confirms quota reset completion
- Provides link to view current usage

#### 2. In-App Notifications

Notifications are stored in the database and accessible via API:

```
GET /api/notifications
PATCH /api/notifications/:id/read
```

### Notification Delivery

**Email:**
- Uses Resend email service
- Configured via environment variables:
  - `EMAIL_API_KEY` or `RESEND_API_KEY`
  - `EMAIL_FROM` (default: noreply@nova-xfinity.ai)
  - `EMAIL_FROM_NAME` (default: Nova‑XFinity AI)

**Frontend:**
- Notifications available via REST API
- Can be displayed using the existing `NotificationManager` component
- Supports real-time updates via polling or WebSocket (future)

### Notification Prevention (Duplicate Prevention)

The system prevents duplicate notifications by:

1. **Database Tracking** (Primary)
   - Stores notifications in `Notification` table
   - Checks if notification already sent for current month and threshold
   - Uses metadata to track feature, threshold, and timestamp

2. **In-Memory Cache** (Fallback)
   - If Notification table doesn't exist, uses in-memory Map
   - Key format: `userId:feature:threshold:month`
   - Clears automatically on month boundary

### Integration Points

#### Usage Increment

When usage is incremented, the system automatically checks quota:

```javascript
// backend/src/services/usage.service.js
export const incrementUsage = async (userId, feature, amount = 1) => {
  // ... increment usage ...
  
  // Check quota asynchronously (non-blocking)
  checkQuotaAndNotify(userId, planFeature, newUsageValue, limit)
    .catch(error => console.error('Error checking quota:', error));
};
```

#### Daily Quota Check

A daily cron job checks all active users' quotas:

**Schedule:** `0 9 * * *` (09:00 UTC daily)

**Process:**
1. Finds all users with active subscriptions
2. Checks quota for each feature (articles, images, videos, research, wordpress, tokens)
3. Sends notifications if thresholds are crossed
4. Logs results for monitoring

### Notification Service API

```javascript
import { checkQuotaAndNotify } from '../services/notification.service.js';

// Check quota and send notifications if needed
const result = await checkQuotaAndNotify(
  userId,
  'articles',      // feature name
  85,              // current usage
  100              // limit
);

// Returns:
// {
//   notified: true,
//   type: 'warning' | 'exceeded',
//   threshold: 0.8 | 1.0,
//   emailSent: true,
//   percentage: 85
// }
```

---

## Token Usage Integration

### Token Quota Tracking

Token usage is tracked separately in the `TokenUsage` model and integrated with quota notifications:

```javascript
// Get token usage for current month
const tokenStats = await getTokenUsageStats(userId);

// Check token quota
const tokenLimit = getFeatureLimit(plan, 'tokenLimit');
await checkQuotaAndNotify(userId, 'tokens', tokenStats.totalTokens, tokenLimit);
```

### Token Usage Reset

Token usage resets are implicit based on `createdAt` timestamps:

- Monthly calculations filter by `createdAt >= monthStart`
- No explicit reset needed (old records retained for analytics)
- Token quota calculations use current month's date range

### Daily Token Quota Check

The daily quota check job includes token usage:

```javascript
// backend/src/jobs/quotaCheck.job.js
const tokenStats = await getTokenUsageStats(userId);
const tokenLimit = getFeatureLimit(plan, 'tokenLimit');

if (tokenLimit !== -1 && tokenStats.totalTokens > 0) {
  await checkQuotaAndNotify(userId, 'tokens', tokenStats.totalTokens, tokenLimit);
}
```

---

## Configuration

### Environment Variables

```bash
# Email Configuration
EMAIL_API_KEY=re_xxxxxxxxxxxxx          # Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxxx         # Alternative name
EMAIL_FROM=noreply@nova-xfinity.ai
EMAIL_FROM_NAME="Nova‑XFinity AI"
FRONTEND_URL=http://localhost:3000

# Cron Jobs
ENABLE_CRON_JOBS=true                   # Enable/disable all cron jobs
RUN_USAGE_RESET_ON_STARTUP=false        # Run reset on server startup (testing)

# Notifications
ENABLE_QUOTA_NOTIFICATIONS=true         # Enable quota notifications
SEND_QUOTA_RESET_EMAILS=true            # Send reset notification emails
```

### Disabling Features

**Disable All Cron Jobs:**
```bash
ENABLE_CRON_JOBS=false
```

**Disable Quota Notifications:**
```bash
ENABLE_QUOTA_NOTIFICATIONS=false
```

**Disable Reset Emails:**
```bash
SEND_QUOTA_RESET_EMAILS=false
```

---

## Database Schema

### Notification Model

```prisma
model Notification {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  type        NotificationType
  title       String
  message     String
  metadata    Json?    // { feature, threshold, currentUsage, limit, percentage }
  read        Boolean  @default(false)
  readAt      DateTime? @map("read_at")
  createdAt   DateTime @default(now()) @map("created_at")
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@index([type])
  @@map("notifications")
}

enum NotificationType {
  QUOTA
  QUOTA_RESET
  SUBSCRIPTION
  SYSTEM
}
```

**Migration Required:**
```bash
cd backend
npx prisma migrate dev --name add_notifications
```

---

## Monitoring & Logging

### Log Messages

The system logs important events:

**Usage Reset:**
```
[Usage Reset] Starting monthly usage reset...
[Usage Reset] Found X usage records to reset
[Usage Reset] Monthly reset completed: { resetCount, notificationCount }
```

**Quota Check:**
```
[Quota Check Job] Starting quota check for all users...
[Quota Check Job] Checking quota for X active users
[Quota Check Job] Sent X notifications to user email@example.com
[Quota Check Job] Quota check completed: { notificationsSent, errors }
```

**Notifications:**
```
[Email Service] Email sent successfully to user@example.com: Quota Warning
[Notification Service] Sent quota warning for user: articles (85/100)
```

### Error Handling

- Errors during usage reset are logged but don't stop the process
- Individual user failures don't affect other users
- Email failures are logged but don't block notifications
- Notification service gracefully handles missing Notification table

---

## Frontend Integration

### Fetching Notifications

```javascript
// Fetch unread notifications
const response = await fetch('/api/notifications', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: notifications } = await response.json();

// Mark notification as read
await fetch(`/api/notifications/${notificationId}/read`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Displaying Notifications

Use the existing `NotificationManager` component:

```javascript
import { NotificationManager } from '@/components/common/Notification';

// In your app layout
<NotificationManager />
```

### Polling for Notifications

```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('/api/notifications');
    const { data: notifications } = await response.json();
    
    // Show new notifications
    notifications.forEach(notif => {
      if (!notif.read) {
        window.showNotification(notif.message, 'warning', 5000);
      }
    });
  }, 60000); // Poll every minute

  return () => clearInterval(interval);
}, []);
```

---

## Testing

### Manual Testing

**Test Usage Reset:**
```javascript
import { triggerUsageReset } from './jobs/usageReset.job.js';
const result = await triggerUsageReset();
console.log(result);
```

**Test Quota Check:**
```javascript
import { triggerQuotaCheck } from './jobs/quotaCheck.job.js';
const result = await triggerQuotaCheck();
console.log(result);
```

**Test Notification:**
```javascript
import { checkQuotaAndNotify } from './services/notification.service.js';
const result = await checkQuotaAndNotify('user-id', 'articles', 85, 100);
console.log(result);
```

### Environment Setup for Testing

```bash
# Enable reset on startup (for testing)
RUN_USAGE_RESET_ON_STARTUP=true

# Use test email service
EMAIL_API_KEY=test_key
```

---

## Future Enhancements

1. **WebSocket Notifications** - Real-time notification delivery
2. **Notification Preferences** - User settings for notification types
3. **SMS Notifications** - Optional SMS alerts for critical quota warnings
4. **Notification Digest** - Weekly summary email instead of individual notifications
5. **Quota Forecasting** - Predict when user will hit limit based on usage patterns
6. **Automatic Plan Recommendations** - Suggest plan upgrades based on usage

---

## Troubleshooting

### Notifications Not Sending

1. Check email configuration:
   ```bash
   echo $EMAIL_API_KEY
   echo $EMAIL_FROM
   ```

2. Verify cron jobs are enabled:
   ```bash
   ENABLE_CRON_JOBS=true
   ```

3. Check logs for errors:
   ```bash
   # Look for [Email Service] or [Notification Service] errors
   ```

### Duplicate Notifications

1. Ensure Notification table exists:
   ```bash
   npx prisma migrate dev
   ```

2. Check notification tracking in database:
   ```sql
   SELECT * FROM notifications WHERE user_id = 'xxx' ORDER BY created_at DESC;
   ```

### Usage Not Resetting

1. Verify cron job is scheduled:
   ```bash
   # Check server logs for "[Cron Job] Scheduling monthly usage reset"
   ```

2. Check for errors in reset process:
   ```bash
   # Look for [Usage Reset] errors in logs
   ```

3. Manually trigger reset for testing:
   ```javascript
   await triggerUsageReset();
   ```

---

## Related Documentation

- [Subscriptions and Billing](../architecture/subscriptions-and-billing.md)
- [Quota Limits](../architecture/quota-limits.md)
- [Database Schema](../architecture/database-schema.md)
