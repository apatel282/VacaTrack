#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is required');
  console.error('\nUsage: DATABASE_URL=your_db_url node server/run-migration.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔗 Connected to database');

    const migrationPath = join(dirname(fileURLToPath(import.meta.url)), 'migrations', '001_add_days_column.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Running migration: 001_add_days_column.sql');
    await client.query(migrationSQL);
    console.log('✅ Migration completed successfully!');

    console.log('\n🔍 Verifying migration...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pto_entries' AND column_name = 'days'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Column "days" exists in pto_entries table');
      console.log('   - Type:', result.rows[0].data_type);
      console.log('   - Nullable:', result.rows[0].is_nullable);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
