import { Hono } from 'hono';
import { spikeEnqueueRequestSchema, queueMessageSchema } from '@opportunity-radar/shared';
import type { Env } from '../types/env';
import { randomUUID } from 'crypto';

const internal = new Hono<{ Bindings: Env }>();

/**
 * Spike endpoint to manually enqueue test messages
 * Requires SPIKE_TOKEN bearer authentication
 */
internal.post('/spike/enqueue', async (c) => {
  // Authenticate using bearer token
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token || token !== c.env.SPIKE_TOKEN) {
    return c.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      401
    );
  }

  try {
    // Parse and validate request body
    const body = await c.req.json();
    const validationResult = spikeEnqueueRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          success: false,
          message: 'Invalid request body',
          errors: validationResult.error.errors,
        },
        400
      );
    }

    const { triggerSource } = validationResult.data;

    // Create queue message
    const eventId = randomUUID();
    const message = queueMessageSchema.parse({
      eventId,
      triggerSource,
      timestamp: new Date().toISOString(),
    });

    // Enqueue to Cloudflare Queue
    await c.env.QUEUE.send(message);

    return c.json({
      success: true,
      eventId,
      message: 'Message enqueued successfully',
    });
  } catch (error) {
    console.error('Failed to enqueue message:', error);
    
    return c.json(
      {
        success: false,
        message: 'Failed to enqueue message',
      },
      500
    );
  }
});

export default internal;
