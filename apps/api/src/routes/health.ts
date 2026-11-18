import { Hono } from 'hono';
import { createDbClient } from '../db/client';
import type { Env } from '../types/env';
import { sql } from 'drizzle-orm';

const health = new Hono<{ Bindings: Env }>();

/**
 * Basic health check endpoint
 */
health.get('/', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Database health check endpoint
 * Tests connection to Neon PostgreSQL
 */
health.get('/db', async (c) => {
  try {
    const databaseUrl = c.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return c.json(
        {
          status: 'error',
          message: 'DATABASE_URL not configured',
          timestamp: new Date().toISOString(),
        },
        500
      );
    }

    const db = createDbClient(databaseUrl);
    
    // Simple connectivity test
    await db.execute(sql`SELECT 1 as test`);

    return c.json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return c.json(
      {
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

export default health;
