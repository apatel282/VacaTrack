# Database Migrations

This directory contains SQL migration files for the VacaTrack PostgreSQL database.

## Available Migrations

### 001_add_days_column.sql
Adds the `days` column to the `pto_entries` table to support manual PTO day overrides.

## How to Apply Migrations

### Option 1: Railway CLI (Recommended)

1. Install Railway CLI if you haven't already:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```

4. Connect to the database and run the migration:
   ```bash
   railway connect postgres
   ```

   Then in the PostgreSQL shell:
   ```sql
   \i server/migrations/001_add_days_column.sql
   ```

### Option 2: Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your PostgreSQL database service
3. Click on the "Data" tab
4. Click "Query" to open the SQL editor
5. Copy and paste the contents of `001_add_days_column.sql`
6. Click "Run Query"

### Option 3: Direct Connection

1. Get your database connection string from Railway:
   ```bash
   railway variables
   ```

   Look for `DATABASE_URL`

2. Connect using psql:
   ```bash
   psql "YOUR_DATABASE_URL_HERE"
   ```

3. Run the migration:
   ```sql
   \i server/migrations/001_add_days_column.sql
   ```

   Or copy/paste the SQL directly.

## Verifying Migration

After running the migration, verify it was successful:

```sql
-- Check that the column exists
\d pto_entries

-- You should see the 'days' column listed
```

## Rollback

If you need to rollback this migration (remove the days column):

```sql
ALTER TABLE pto_entries DROP COLUMN IF EXISTS days;
```

**⚠️ Warning:** Rolling back will delete all manual day override data!
