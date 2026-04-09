// Set to true to print framework worker logs ([worker] ...).
// Logs from inside your job handlers are unaffected.
export const WORKER_LOGS = false;

export const log = (...args: unknown[]) => {
  if (WORKER_LOGS) console.log(...args);
};
