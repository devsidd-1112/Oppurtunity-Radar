import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.dev.vars') });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Connecting to database...');
  const sql = neon(databaseUrl);
  // @ts-expect-error - Neon serverless driver type compatibility
  const db = drizzle(sql);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') });

  console.log('✅ Migrations completed successfully');
  process.exit(0);
}

runMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
