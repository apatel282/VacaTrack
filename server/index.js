import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();

const port = Number(process.env.PORT || 8787);
const databaseUrl = process.env.DATABASE_URL;
const allowOrigin = process.env.CORS_ORIGIN || '*';
const useSsl = process.env.DATABASE_SSL !== 'false';

if (!databaseUrl) {
  console.error('Missing DATABASE_URL.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

app.use(cors({ origin: allowOrigin }));
app.use(express.json({ limit: '1mb' }));

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toISOString().slice(0, 10);
}

function normalizeTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.toISOString();
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('select 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) });
  }
});

app.get('/api/settings', async (_req, res) => {
  try {
    const result = await pool.query(
      'select * from settings order by id asc limit 1'
    );
    if (result.rows.length === 0) {
      res.json(null);
      return;
    }

    const row = result.rows[0];
    res.json({
      periodStart: row.period_start_month && row.period_start_year
        ? { month: row.period_start_month, year: row.period_start_year }
        : null,
      periodEnd: row.period_end_month && row.period_end_year
        ? { month: row.period_end_month, year: row.period_end_year }
        : null,
      annualAllotment: row.annual_allotment || 0,
      theme: row.theme || 'system',
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/settings', async (req, res) => {
  const settings = req.body;
  try {
    const existing = await pool.query(
      'select id from settings order by id asc limit 1'
    );

    const payload = [
      settings.periodStart?.month || null,
      settings.periodStart?.year || null,
      settings.periodEnd?.month || null,
      settings.periodEnd?.year || null,
      settings.annualAllotment || 0,
      settings.theme || 'system',
    ];

    if (existing.rows.length > 0) {
      await pool.query(
        `update settings
         set period_start_month = $1,
             period_start_year = $2,
             period_end_month = $3,
             period_end_year = $4,
             annual_allotment = $5,
             theme = $6,
             updated_at = now()
         where id = $7`,
        [...payload, existing.rows[0].id]
      );
    } else {
      await pool.query(
        `insert into settings (
          period_start_month,
          period_start_year,
          period_end_month,
          period_end_year,
          annual_allotment,
          theme,
          created_at,
          updated_at
        ) values ($1, $2, $3, $4, $5, $6, now(), now())`,
        payload
      );
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/entries', async (_req, res) => {
  try {
    const result = await pool.query(
      'select * from pto_entries order by start_date desc'
    );
    const entries = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      startDate: normalizeDate(row.start_date),
      endDate: normalizeDate(row.end_date),
      days: row.days ?? undefined, // Include days field, undefined if null
      notes: row.notes || '',
      createdAt: normalizeTimestamp(row.created_at),
      updatedAt: normalizeTimestamp(row.updated_at),
    }));
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/entries', async (req, res) => {
  const entry = req.body;
  try {
    await pool.query(
      `insert into pto_entries (
        id,
        type,
        start_date,
        end_date,
        days,
        notes,
        created_at,
        updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        entry.id,
        entry.type,
        entry.startDate,
        entry.endDate,
        entry.days ?? null, // Store days if provided, null otherwise
        entry.notes || '',
        entry.createdAt,
        entry.updatedAt,
      ]
    );
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/entries/:id', async (req, res) => {
  const entry = req.body;
  const { id } = req.params;
  try {
    await pool.query(
      `update pto_entries
       set type = $1,
           start_date = $2,
           end_date = $3,
           days = $4,
           notes = $5,
           updated_at = $6
       where id = $7`,
      [
        entry.type,
        entry.startDate,
        entry.endDate,
        entry.days ?? null, // Update days field
        entry.notes || '',
        entry.updatedAt || new Date().toISOString(),
        id,
      ]
    );
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('delete from pto_entries where id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/state', async (_req, res) => {
  try {
    const settingsResult = await pool.query(
      'select * from settings order by id asc limit 1'
    );
    const entriesResult = await pool.query(
      'select * from pto_entries order by start_date desc'
    );

    const settingsRow = settingsResult.rows[0];
    const settings = settingsRow
      ? {
          periodStart: settingsRow.period_start_month && settingsRow.period_start_year
            ? { month: settingsRow.period_start_month, year: settingsRow.period_start_year }
            : null,
          periodEnd: settingsRow.period_end_month && settingsRow.period_end_year
            ? { month: settingsRow.period_end_month, year: settingsRow.period_end_year }
            : null,
          annualAllotment: settingsRow.annual_allotment || 0,
          theme: settingsRow.theme || 'system',
        }
      : null;

    const entries = entriesResult.rows.map((row) => ({
      id: row.id,
      type: row.type,
      startDate: normalizeDate(row.start_date),
      endDate: normalizeDate(row.end_date),
      days: row.days ?? undefined, // Include days field
      notes: row.notes || '',
      createdAt: normalizeTimestamp(row.created_at),
      updatedAt: normalizeTimestamp(row.updated_at),
    }));

    res.json({
      settings,
      entries,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/state', async (req, res) => {
  const state = req.body;
  const client = await pool.connect();
  try {
    await client.query('begin');

    if (state.settings) {
      const existing = await client.query(
        'select id from settings order by id asc limit 1'
      );
      const payload = [
        state.settings.periodStart?.month || null,
        state.settings.periodStart?.year || null,
        state.settings.periodEnd?.month || null,
        state.settings.periodEnd?.year || null,
        state.settings.annualAllotment || 0,
        state.settings.theme || 'system',
      ];

      if (existing.rows.length > 0) {
        await client.query(
          `update settings
           set period_start_month = $1,
               period_start_year = $2,
               period_end_month = $3,
               period_end_year = $4,
               annual_allotment = $5,
               theme = $6,
               updated_at = now()
           where id = $7`,
          [...payload, existing.rows[0].id]
        );
      } else {
        await client.query(
          `insert into settings (
            period_start_month,
            period_start_year,
            period_end_month,
            period_end_year,
            annual_allotment,
            theme,
            created_at,
            updated_at
          ) values ($1, $2, $3, $4, $5, $6, now(), now())`,
          payload
        );
      }
    }

    await client.query('delete from pto_entries');

    if (state.entries?.length) {
      const insertValues = [];
      const params = [];
      let index = 1;
      for (const entry of state.entries) {
        insertValues.push(
          `($${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++}, $${index++})`
        );
        params.push(
          entry.id,
          entry.type,
          entry.startDate,
          entry.endDate,
          entry.days ?? null, // Handle days field in bulk import
          entry.notes || '',
          entry.createdAt,
          entry.updatedAt
        );
      }
      await client.query(
        `insert into pto_entries (
          id,
          type,
          start_date,
          end_date,
          days,
          notes,
          created_at,
          updated_at
        ) values ${insertValues.join(', ')}`,
        params
      );
    }

    await client.query('commit');
    res.status(204).end();
  } catch (error) {
    await client.query('rollback');
    res.status(500).json({ error: String(error) });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`API server listening on :${port}`);
});
