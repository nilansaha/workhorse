import { log } from "./config";
import { executeOne } from "./executor";

const CONCURRENCY = 1;
const POLL_INTERVAL = 1000;

let running = false;

const worker = async () => {
  while (running) {
    const hadJob = await executeOne();
    if (!hadJob) await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
};

export const startWorker = () => {
  if (running) return;
  running = true;

  for (let i = 0; i < CONCURRENCY; i++) {
    worker();
  }

  log(`[worker] started (concurrency=${CONCURRENCY}, poll=${POLL_INTERVAL}ms)`);
};

export const stopWorker = () => {
  running = false;
  log("[worker] stopping");
};
