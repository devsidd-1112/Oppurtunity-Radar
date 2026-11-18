import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types/env';
import health from './routes/health';
import internal from './routes/internal';
import { handleQueueMessage } from './handlers/queue';
import { handleScheduled } from './handlers/scheduled';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin, // Allow all origins for Phase 0
    credentials: true,
  })
);

// Routes
app.route('/health', health);
app.route('/internal', internal);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Opportunity Radar API',
    version: '0.1.0',
    phase: 0,
    timestamp: new Date().toISOString(),
  });
});

// Export HTTP handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  // Queue consumer handler
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    await handleQueueMessage(batch, env);
  },

  // Scheduled handler (cron trigger)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await handleScheduled(event, env, ctx);
  },
};
