import { queueMessageSchema } from '@opportunity-radar/shared';
import type { Env } from '../types/env';
import { randomUUID } from 'crypto';

/**
 * Scheduled handler (cron trigger)
 * 
 * Enqueues a Phase 0 test message for background processing.
 * Does not perform heavy operations directly.
 */
export async function handleScheduled(
  event: ScheduledEvent,
  env: Env,
  _ctx: ExecutionContext
): Promise<void> {
  try {
    console.log('Cron trigger fired at:', new Date(event.scheduledTime).toISOString());

    // Create test message
    const eventId = randomUUID();
    const message = queueMessageSchema.parse({
      eventId,
      triggerSource: 'cron',
      timestamp: new Date().toISOString(),
    });

    // Enqueue for background processing
    await env.QUEUE.send(message);

    console.log(`Enqueued test message with event ID: ${eventId}`);
  } catch (error) {
    console.error('Scheduled handler error:', error);
    // Don't throw - let the worker continue
  }
}
