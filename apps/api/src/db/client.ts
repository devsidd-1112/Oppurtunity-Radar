import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

/**
 * Create a Drizzle database client using Neon HTTP driver
 * Compatible with Cloudflare Workers
 */
export function createDbClient(databaseUrl: string) {
  const sql = neon(databaseUrl);
  // @ts-expect-error - Neon serverless driver type compatibility
  return drizzle(sql, { schema });
}

export type DbClient = ReturnType<typeof createDbClient>;
