import { z } from 'zod';

/**
 * Queue message schema for Phase 0 integration testing
 */
export const queueMessageSchema = z.object({
  eventId: z.string().uuid(),
  triggerSource: z.enum(['cron', 'manual']),
  timestamp: z.string().datetime(),
});

export type QueueMessage = z.infer<typeof queueMessageSchema>;

/**
 * Gemini response schema for Phase 0 integration testing
 */
export const geminiResponseSchema = z.object({
  status: z.literal('ok'),
  message: z.string().min(1),
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;

/**
 * Spike enqueue request schema
 */
export const spikeEnqueueRequestSchema = z.object({
  triggerSource: z.enum(['cron', 'manual']),
});

export type SpikeEnqueueRequest = z.infer<typeof spikeEnqueueRequestSchema>;

/**
 * Spike enqueue response schema
 */
export const spikeEnqueueResponseSchema = z.object({
  success: z.boolean(),
  eventId: z.string().uuid(),
  message: z.string(),
});

export type SpikeEnqueueResponse = z.infer<typeof spikeEnqueueResponseSchema>;

/**
 * Health check response schemas
 */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const dbHealthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  message: z.string(),
  timestamp: z.string().datetime(),
});

export type DbHealthResponse = z.infer<typeof dbHealthResponseSchema>;
