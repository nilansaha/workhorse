import { log } from "./config";
import { sql } from "./db";
import { getHandler } from "./registry";

type Job = {
  id: string;
  job_name: string;
  payload: any;
  attempts: number;
  max_attempts: number;
};

const claimJob = async (): Promise<Job | null> => {
  const rows = await sql`
    UPDATE workhorse
    SET status = 'running', started_at = now(), attempts = attempts + 1, last_attempt_at = now()
    WHERE id = (
      SELECT id FROM workhorse
      WHERE status = 'pending'
        AND run_at <= now()
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, job_name, payload, attempts, max_attempts
  `;
  return rows.length > 0 ? (rows[0] as Job) : null;
};

const markDone = async (jobId: string, durationMs: number) => {
  await sql`UPDATE workhorse SET status = 'done', completed_at = now(), duration_ms = ${durationMs} WHERE id = ${jobId}`;
};

const markFailed = async (
  jobId: string,
  attempt: number,
  maxAttempts: number,
  error: string,
) => {
  if (attempt < maxAttempts) {
    const backoffSeconds = Math.pow(2, attempt) * 10;
    await sql`
      UPDATE workhorse
      SET status = 'pending', run_at = now() + interval '1 second' * ${backoffSeconds}, last_error = ${error}
      WHERE id = ${jobId}
    `;
  } else {
    await sql`UPDATE workhorse SET status = 'failed', last_error = ${error} WHERE id = ${jobId}`;
  }
};

export const executeOne = async (): Promise<boolean> => {
  const job = await claimJob();
  if (!job) return false;

  const handler = getHandler(job.job_name);
  if (!handler) {
    await markFailed(
      job.id,
      job.attempts,
      job.max_attempts,
      `No handler registered for "${job.job_name}"`,
    );
    log(`[worker] no handler for "${job.job_name}" (job ${job.id.slice(0, 8)})`);
    return true;
  }

  log(
    `[worker] claimed ${job.job_name} (${job.id.slice(0, 8)}) attempt ${job.attempts}/${job.max_attempts}`,
  );

  const start = Date.now();
  try {
    await handler(job.payload);
    const duration = Date.now() - start;
    await markDone(job.id, duration);
    log(`[worker] done ${job.job_name} (${job.id.slice(0, 8)}) ${duration}ms`);
  } catch (err: any) {
    const duration = Date.now() - start;
    const errorMsg = err?.message ?? String(err);
    const willRetry = job.attempts < job.max_attempts;
    await markFailed(job.id, job.attempts, job.max_attempts, errorMsg);
    log(
      `[worker] failed ${job.job_name} (${job.id.slice(0, 8)}) ${errorMsg} retry=${willRetry} (${duration}ms)`,
    );
  }

  return true;
};
