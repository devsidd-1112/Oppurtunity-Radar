import { queueMessageSchema } from '@opportunity-radar/shared';
import { createDbClient } from '../db/client';
import { phase0IntegrationEvents } from '../db/schema';
import { makeGeminiTestRequest, GeminiError } from '../services/gemini';
import type { Env } from '../types/env';

/**
 * Process queue messages
 * 
 * This handler:
 * 1. Validates the queue message
 * 2. Connects to the database
 * 3. Makes a Gemini API request
 * 4. Persists the result
 * 5. Handles errors and retries
 */
export async function handleQueueMessage(
  batch: MessageBatch,
  env: Env
): Promise<void> {
  const db = createDbClient(env.DATABASE_URL);

  for (const message of batch.messages) {
    try {
      console.log('Processing queue message:', message.id);

      // Validate message body
      const validationResult = queueMessageSchema.safeParse(message.body);
      
      if (!validationResult.success) {
        console.error('Invalid queue message format:', validationResult.error);
        // Ack the message to remove it from queue (malformed messages should not retry)
        message.ack();
        continue;
      }

      const { eventId, triggerSource } = validationResult.data;

      // Make Gemini API request
      let geminiResult;
      let status: 'success' | 'error' = 'success';
      let errorMessage: string | undefined;

      try {
        geminiResult = await makeGeminiTestRequest({
          apiKey: env.GEMINI_API_KEY,
          model: env.GEMINI_MODEL,
        });
      } catch (error) {
        status = 'error';
        errorMessage = error instanceof GeminiError 
          ? error.message 
          : 'Unknown Gemini API error';
        
        console.error('Gemini API error:', errorMessage, error);
        
        // For transient errors, retry
        if (error instanceof GeminiError && error.statusCode === 429) {
          console.log('Rate limited, will retry');
          message.retry();
          continue;
        }
        
        // For configuration errors, fail permanently
        if (error instanceof GeminiError && 
            (error.message.includes('not configured') || error.statusCode === 400)) {
          console.error('Configuration error, not retrying');
          geminiResult = null;
        } else {
          // Other errors, retry
          console.log('Gemini error, will retry');
          message.retry();
          continue;
        }
      }

      // Persist to database
      try {
        await db.insert(phase0IntegrationEvents).values({
          id: eventId,
          triggerSource,
          geminiModel: env.GEMINI_MODEL,
          geminiResult: geminiResult || { error: errorMessage },
          status,
          errorMessage,
        });

        console.log(`Successfully processed event ${eventId}`);
        message.ack();
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // Check for unique constraint violation (duplicate event ID)
        if (dbError instanceof Error && dbError.message.includes('duplicate key')) {
          console.log('Event already processed, acknowledging');
          message.ack();
        } else {
          // Retry on database errors
          console.log('Database error, will retry');
          message.retry();
        }
      }
    } catch (error) {
      console.error('Unexpected error processing message:', error);
      // Retry on unexpected errors
      message.retry();
    }
  }
}
