import { describe, it, expect } from 'vitest';
import {
  queueMessageSchema,
  geminiResponseSchema,
  spikeEnqueueRequestSchema,
} from '@opportunity-radar/shared';

describe('Queue Message Validation', () => {
  it('should validate a valid queue message', () => {
    const validMessage = {
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      triggerSource: 'cron',
      timestamp: '2024-11-18T10:00:00Z',
    };

    const result = queueMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
  });

  it('should reject invalid trigger source', () => {
    const invalidMessage = {
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      triggerSource: 'invalid',
      timestamp: '2024-11-18T10:00:00Z',
    };

    const result = queueMessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID format', () => {
    const invalidMessage = {
      eventId: 'not-a-uuid',
      triggerSource: 'cron',
      timestamp: '2024-11-18T10:00:00Z',
    };

    const result = queueMessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it('should reject invalid timestamp', () => {
    const invalidMessage = {
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      triggerSource: 'cron',
      timestamp: 'invalid-date',
    };

    const result = queueMessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });
});

describe('Gemini Response Validation', () => {
  it('should validate a valid Gemini response', () => {
    const validResponse = {
      status: 'ok',
      message: 'Test successful',
    };

    const result = geminiResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject wrong status value', () => {
    const invalidResponse = {
      status: 'error',
      message: 'Test failed',
    };

    const result = geminiResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('should reject empty message', () => {
    const invalidResponse = {
      status: 'ok',
      message: '',
    };

    const result = geminiResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const invalidResponse = {
      status: 'ok',
    };

    const result = geminiResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});

describe('Spike Enqueue Request Validation', () => {
  it('should validate manual trigger source', () => {
    const validRequest = {
      triggerSource: 'manual',
    };

    const result = spikeEnqueueRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate cron trigger source', () => {
    const validRequest = {
      triggerSource: 'cron',
    };

    const result = spikeEnqueueRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject invalid trigger source', () => {
    const invalidRequest = {
      triggerSource: 'webhook',
    };

    const result = spikeEnqueueRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});
