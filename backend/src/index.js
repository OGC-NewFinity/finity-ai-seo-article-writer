import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { errorHandler } from './middleware/error.middleware.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root (parent directory of backend/)
dotenv.config({ path: join(__dirname, '../../.env') });
// Also try loading from backend directory for backward compatibility
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser()); // Parse cookies from request

// Stripe webhook needs raw body for signature verification
// Apply raw body parser only to Stripe webhook route
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON body parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import subscriptionRoutes from './routes/subscription.routes.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import tokenUsageRoutes from './routes/tokenUsage.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import statsRoutes from './routes/stats.routes.js';
import { articleRoutes } from './features/article/index.js';
import { researchRoutes } from './features/research/index.js';
import { mediaRoutes } from './features/media/index.js';

app.use('/api/subscription', subscriptionRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/token-usage', tokenUsageRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/research', researchRoutes);
// TODO: Import and mount other routes
// app.use('/api/auth', authRoutes);
// app.use('/api/settings', settingsRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize cron jobs
if (process.env.ENABLE_CRON_JOBS !== 'false') {
  try {
    const { scheduleUsageReset } = await import('./jobs/usageReset.job.js');
    const { scheduleQuotaCheck } = await import('./jobs/quotaCheck.job.js');
    
    scheduleUsageReset();
    scheduleQuotaCheck();
    
    console.log('✅ Cron jobs initialized');
  } catch (error) {
    console.error('❌ Error initializing cron jobs:', error);
  }
} else {
  console.log('⏭️  Cron jobs disabled (ENABLE_CRON_JOBS=false)');
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
