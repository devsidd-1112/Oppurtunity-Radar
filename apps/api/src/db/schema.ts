import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

/**
 * Phase 0 integration events table
 * 
 * This is a temporary table for technical feasibility testing.
 * It will be reviewed and likely replaced during the database design phase.
 */
export const phase0IntegrationEvents = pgTable('phase0_integration_events', {
  id: uuid('id').primaryKey(), // Event ID from queue message
  triggerSource: text('trigger_source').notNull(),
  geminiModel: text('gemini_model').notNull(),
  geminiResult: jsonb('gemini_result').notNull(),
  status: text('status').notNull(), // 'success' | 'error'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Phase0IntegrationEvent = typeof phase0IntegrationEvents.$inferSelect;
export type NewPhase0IntegrationEvent = typeof phase0IntegrationEvents.$inferInsert;
