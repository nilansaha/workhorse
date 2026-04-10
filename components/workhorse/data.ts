export type Job = {
  id: string;
  job_name: string;
  payload: Record<string, unknown>;
  status: "pending" | "running" | "done" | "failed";
  attempts: number;
  max_attempts: number;
  run_at: string;
  scheduled: boolean;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  last_error: string | null;
  last_attempt_at: string | null;
  created_at: string;
};
