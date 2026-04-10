import { sql } from "./db";

// Generic loose row type. Consumers cast to their own shape (e.g. Job, JobStat)
// at the call site. Using an explicit type here keeps tsc from trying to inline
// postgres-internal generics into the emitted .d.ts files.
type Row = Record<string, unknown>;

export const getJobById = async (id: string): Promise<Row | null> => {
  const [job] = await sql`SELECT * FROM workhorse WHERE id = ${id}`;
  return (job as Row | undefined) ?? null;
};

export const getRecentJobs = async (limit = 20): Promise<Row[]> => {
  const rows = await sql`
    SELECT * FROM workhorse
    WHERE scheduled = false
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Row[];
};

export const getScheduledJobs = async (limit = 50): Promise<Row[]> => {
  const rows = await sql`
    SELECT * FROM workhorse
    WHERE scheduled = true
    ORDER BY run_at ASC, created_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Row[];
};

export const getFailedJobs = async (): Promise<Row[]> => {
  const rows = await sql`SELECT * FROM workhorse WHERE status = 'failed' ORDER BY created_at DESC`;
  return rows as unknown as Row[];
};

export const getStuckJobs = async (
  thresholdMinutes = 5,
): Promise<Row[]> => {
  const rows = await sql`
    SELECT * FROM workhorse
    WHERE status = 'running'
      AND started_at < now() - interval '1 minute' * ${thresholdMinutes}
    ORDER BY started_at ASC
  `;
  return rows as unknown as Row[];
};

export const getJobStats = async (): Promise<Row[]> => {
  const rows = await sql`
    SELECT
      job_name,
      count(*)::int as total,
      count(*) FILTER (WHERE status = 'done')::int as done,
      count(*) FILTER (WHERE status = 'failed')::int as failed,
      round(avg(duration_ms) FILTER (WHERE status = 'done'))::int as avg_duration_ms,
      min(duration_ms) FILTER (WHERE status = 'done')::int as min_duration_ms,
      max(duration_ms) FILTER (WHERE status = 'done')::int as max_duration_ms
    FROM workhorse
    GROUP BY job_name
    ORDER BY job_name
  `;
  return rows as unknown as Row[];
};
