# Email & Autoresponder Integration

## Overview

This document describes the email service integration and autoresponder system for the Nova‑XFinity AI Article Writer application.

## Email Service Setup

### Service Providers

We support multiple email service providers:

1. **Resend** (Recommended)
   - Modern API
   - Great developer experience
   - React Email support

2. **Nodemailer**
   - Works with any SMTP server
   - Gmail, SendGrid, Mailgun, etc.

3. **SendGrid**
   - Reliable delivery
   - Good analytics

4. **AWS SES**
   - Cost-effective
   - High volume support

### Configuration

```javascript
// backend/src/config/email.js
export const emailConfig = {
  service: process.env.EMAIL_SERVICE || 'resend',
  apiKey: process.env.EMAIL_API_KEY,
  from: process.env.EMAIL_FROM || 'noreply@finity.ai',
  replyTo: process.env.EMAIL_REPLY_TO
};
```

## Resend Integration

### Setup

1. **Install Resend:**
   ```bash
   npm install resend
   ```

2. **Get API Key:**
   - Sign up at https://resend.com
   - Get API key from dashboard

3. **Configure:**
   ```env
   EMAIL_SERVICE=resend
   EMAIL_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=noreply@finity.ai
   ```

### Implementation

```javascript
// backend/src/services/email.service.js
import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_API_KEY);

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};
```

## Email Templates

### React Email Templates

**Install React Email:**
```bash
npm install react-email @react-email/components
```

**Template Example:**

```javascript
// backend/src/templates/email/WelcomeEmail.jsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr
} from '@react-email/components';

export const WelcomeEmail = ({ userName }) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={title}>Welcome to Nova‑XFinity AI!</Text>
          </Section>
          
          <Section style={content}>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Welcome to Nova‑XFinity AI Article Writer. Start creating
              high-quality SEO-optimized articles with the power of AI.
            </Text>
            <Button style={button} href="https://finity.ai/dashboard">
              Get Started
            </Button>
          </Section>
          
          <Hr style={hr} />
          <Text style={footer}>
            © 2024 Nova‑XFinity AI. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, sans-serif'
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px'
};

// ... other styles
```

### Template Rendering

```javascript
// backend/src/services/email.service.js
import { render } from '@react-email/render';
import { WelcomeEmail } from '../templates/email/WelcomeEmail';

export const sendWelcomeEmail = async (user) => {
  const html = await render(<WelcomeEmail userName={user.name} />);
  const text = `Welcome ${user.name}!`;
  
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Nova‑XFinity AI',
    html,
    text
  });
};
```

## Email Templates Library

### Open-Source Resources

1. **React Email Templates**
   - Repository: https://react.email/templates
   - Pre-built templates
   - Professional designs

2. **React Emails Pro**
   - Website: https://www.reactemailspro.com/
   - Premium templates
   - Ready to use

3. **Email Templates by Mailgun**
   - Repository: https://github.com/mailgun/transactional-email-templates
   - HTML/CSS templates
   - Responsive designs

### Template Types

#### 1. Welcome Email

```javascript
export const WelcomeEmail = ({ userName, verificationLink }) => {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Welcome {userName}!</Text>
          <Button href={verificationLink}>Verify Email</Button>
        </Container>
      </Body>
    </Html>
  );
};
```

#### 2. Email Verification

```javascript
export const VerificationEmail = ({ userName, verificationLink }) => {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Hi {userName},</Text>
          <Text>Click the link below to verify your email:</Text>
          <Button href={verificationLink}>Verify Email</Button>
          <Text>This link expires in 24 hours.</Text>
        </Container>
      </Body>
    </Html>
  );
};
```

#### 3. Password Reset

```javascript
export const PasswordResetEmail = ({ userName, resetLink }) => {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Hi {userName},</Text>
          <Text>You requested a password reset. Click the link below:</Text>
          <Button href={resetLink}>Reset Password</Button>
          <Text>This link expires in 1 hour.</Text>
          <Text>If you didn't request this, ignore this email.</Text>
        </Container>
      </Body>
    </Html>
  );
};
```

#### 4. Article Published

```javascript
export const ArticlePublishedEmail = ({ userName, articleTitle, articleLink }) => {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Hi {userName},</Text>
          <Text>Your article "{articleTitle}" has been published!</Text>
          <Button href={articleLink}>View Article</Button>
        </Container>
      </Body>
    </Html>
  );
};
```

## Autoresponder System

### Queue System

Use Bull/BullMQ for async email processing:

```bash
npm install bull
```

```javascript
// backend/src/config/queue.js
import Queue from 'bull';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const emailQueue = new Queue('emails', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});
```

### Autoresponder Service

```javascript
// backend/src/services/autoresponder.service.js
import { emailQueue } from '../config/queue';
import { sendWelcomeEmail } from './email.service';

// Process email queue
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case 'welcome':
      return sendWelcomeEmail(data.user);
    case 'verification':
      return sendVerificationEmail(data.user);
    case 'password-reset':
      return sendPasswordResetEmail(data.user, data.token);
    case 'article-published':
      return sendArticlePublishedEmail(data.user, data.article);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
});

// Add email to queue
export const queueEmail = async (type, data) => {
  await emailQueue.add(type, { type, data }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};
```

### Autoresponder Triggers

```javascript
// User registration
export const onUserRegistered = async (user) => {
  // Queue welcome email
  await queueEmail('welcome', { user });
  
  // Queue verification email
  if (!user.emailVerified) {
    const token = generateVerificationToken(user.id);
    await queueEmail('verification', { user, token });
  }
};

// Article published
export const onArticlePublished = async (user, article) => {
  await queueEmail('article-published', { user, article });
};
```

## Email Preferences

### User Preferences

```javascript
// User email preferences model
model EmailPreferences {
  id          String   @id @default(uuid())
  userId      String   @unique
  welcome     Boolean  @default(true)
  articles    Boolean  @default(true)
  marketing   Boolean  @default(false)
  updates     Boolean  @default(true)
}

// Check preferences before sending
export const sendEmailIfAllowed = async (user, type, emailData) => {
  const prefs = await getEmailPreferences(user.id);
  
  if (!prefs[type]) {
    return; // User opted out
  }
  
  await queueEmail(type, emailData);
};
```

## Email Analytics

### Tracking

```javascript
// Add tracking pixel
const trackingPixel = `<img src="https://api.finity.ai/email/track/${emailId}" width="1" height="1" />`;

// Track opens
export const trackEmailOpen = async (emailId) => {
  await updateEmailMetrics(emailId, { opened: true, openedAt: new Date() });
};

// Track clicks
export const trackEmailClick = async (emailId, link) => {
  await updateEmailMetrics(emailId, { 
    clicked: true, 
    clickedAt: new Date(),
    clickedLink: link
  });
};
```

## Best Practices

1. **Use Templates:** Consistent design
2. **Queue Emails:** Don't block requests
3. **Handle Failures:** Retry logic
4. **Respect Preferences:** Opt-out support
5. **Test Emails:** Preview before sending
6. **Monitor Delivery:** Track bounces
7. **Personalize:** Use user data
8. **Mobile Friendly:** Responsive design

## Testing

### Email Testing

```javascript
// Use email testing service (Mailtrap, Ethereal)
const testEmailConfig = {
  service: 'ethereal',
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.TEST_EMAIL_USER,
    pass: process.env.TEST_EMAIL_PASS
  }
};

// In development, use test service
if (process.env.NODE_ENV === 'development') {
  // Use test email service
}
```

## Next Steps

- Review [Authentication Integration](authentication.md) for auth emails
- Check [Open Source Resources](open-source-resources.md) for template libraries
- See [Backend Architecture](../architecture/backend.md) for service implementation
