/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
  // Database
  DATABASE_URL: string;

  // Gemini API
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;

  // Internal authentication
  SPIKE_TOKEN: string;

  // Queue bindings
  QUEUE: Queue;
  DLQ: Queue;
}
