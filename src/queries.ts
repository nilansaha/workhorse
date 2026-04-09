import { sql } from "./db";

export const getJobById = async (id: string) => {
  const [job] = await sql`SELECT * FROM workhorse WHERE id = ${id}`;
  return job ?? null;
};

export const getRecentJobs = async (limit = 20) => {
  return sql`SELECT * FROM workhorse ORDER BY created_at DESC LIMIT ${limit}`;
};

export const getFailedJobs = async () => {
  return sql`SELECT * FROM workhorse WHERE status = 'failed' ORDER BY created_at DESC`;
};

export const getStuckJobs = async (thresholdMinutes = 5) => {
  return sql`
    SELECT * FROM workhorse
    WHERE status = 'running'
      AND started_at < now() - interval '1 minute' * ${thresholdMinutes}
    ORDER BY started_at ASC
  `;
};

export const getJobStats = async () => {
  return sql`
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
};
