"use client";

import { Suspense, use, useEffect, useState } from "react";
import { Icons } from "~/components/icons";
import type { Job } from "./data";

const makeJobPromise = (job: Job) =>
  new Promise<Job>((resolve) => setTimeout(() => resolve(job), 900));

const Spinner = () => (
  <Icons.spinner className="size-5 text-[#A1A1AA] animate-spin" />
);

const statusClasses: Record<string, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-[rgba(161,161,170,0.08)] text-[#71717A]",
    dot: "bg-[#555555]",
  },
  running: {
    badge: "bg-[rgba(217,179,75,0.1)] text-[#D9B34B]",
    dot: "bg-[#D9B34B]",
  },
  done: {
    badge: "bg-[rgba(74,190,120,0.1)] text-[#4ABE78]",
    dot: "bg-[#4ABE78]",
  },
  failed: {
    badge: "bg-[rgba(217,95,95,0.1)] text-[#D95F5F]",
    dot: "bg-[#D95F5F]",
  },
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const colorizeJson = (value: unknown) => {
  const json = escapeHtml(JSON.stringify(value, null, 2));
  return json.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match, str, colon, kw, num) => {
      if (str && colon) {
        // object key
        return `<span class="workhorse-json-key">${str}</span>${colon}`;
      }
      if (str) {
        // string value
        return `<span class="workhorse-json-string">${str}</span>`;
      }
      if (kw) {
        return `<span class="workhorse-json-keyword">${match}</span>`;
      }
      if (num) {
        return `<span class="workhorse-json-number">${match}</span>`;
      }
      return match;
    },
  );
};

const formatDelta = (a: string | null, b: string | null) => {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (ms < 0) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
};

type DrawerProps = {
  job: Job;
  onClose: () => void;
};

export const JobDrawer = ({ job, onClose }: DrawerProps) => {
  const [mounted, setMounted] = useState(false);
  const [jobPromise] = useState<Promise<Job>>(() => makeJobPromise(job));

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="z-40 fixed inset-0 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`top-0 right-0 bottom-0 z-50 fixed flex flex-col border-l border-[#252422] bg-[#191817] w-[420px] shadow-[-8px_0_24px_rgba(0,0,0,0.4)] transition-transform duration-200 ease-out ${
          mounted ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-6 z-10 cursor-pointer text-[#555555]"
        >
          <Icons.cross className="size-4" />
        </button>

        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <JobDrawerContent jobPromise={jobPromise} />
        </Suspense>
      </div>
    </>
  );
};

const JobDrawerContent = ({ jobPromise }: { jobPromise: Promise<Job> }) => {
  const job: Job = use(jobPromise);
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(job.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isScheduled = job.scheduled;
  const createdToRunAt = isScheduled
    ? formatDelta(job.created_at, job.run_at)
    : null;
  const runAtToStarted = isScheduled
    ? formatDelta(job.run_at, job.started_at)
    : null;
  const queuedToStarted = isScheduled
    ? null
    : formatDelta(job.created_at, job.started_at);
  const startedToCompleted = formatDelta(job.started_at, job.completed_at);

  const completedDotClass =
    job.status === "done" ? "bg-[#4ABE78]" : "bg-[#555555]";
  const cls = statusClasses[job.status];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2 px-6 py-4 border-b border-[#252422]">
        <div className="flex justify-between items-center pr-8">
          <h2 className="font-semibold text-lg text-[#DCDCDC]">
            {job.job_name}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-[#A1A1AA] font-mono">{job.id}</p>
          <button
            type="button"
            onClick={copyId}
            className={`cursor-pointer ${
              copied ? "text-[#A1A1AA]" : "text-[#555555]"
            }`}
          >
            {copied ? (
              <Icons.check className="size-3" />
            ) : (
              <Icons.copy className="size-3" />
            )}
          </button>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-medium text-xs ${cls.badge}`}
        >
          <span className={`rounded-full w-1.5 h-1.5 ${cls.dot}`} />
          {job.status === "done"
            ? "Complete"
            : job.status === "running"
              ? "Running"
              : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-5 overflow-y-auto">
        {/* Timeline */}
        <div className="flex flex-col mb-6">
          {/* Triggered */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="rounded-full w-2 h-2 shrink-0 bg-[#555555]" />
            </div>
            <p className="text-sm text-[#A1A1AA]">Triggered</p>
            <p className="ml-auto text-sm text-[#A1A1AA]">
              {formatDate(job.created_at)}
            </p>
          </div>

          {/* Scheduled step (only for explicitly scheduled jobs) */}
          {isScheduled && (
            <>
              {createdToRunAt && (
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex justify-center w-2">
                    <span className="w-px h-8 bg-[#353432]" />
                  </div>
                  <p className="font-mono text-sm text-[#555555]">
                    {createdToRunAt}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="rounded-full w-2 h-2 shrink-0 bg-[#555555]" />
                </div>
                <p className="text-sm text-[#A1A1AA]">Scheduled</p>
                <p className="ml-auto text-sm text-[#A1A1AA]">
                  {formatDate(job.run_at)}
                </p>
              </div>
              {runAtToStarted && (
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex justify-center w-2">
                    <span className="w-px h-8 bg-[#353432]" />
                  </div>
                  <p className="font-mono text-sm text-[#555555]">
                    {runAtToStarted}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Queue duration (only for non-scheduled jobs) */}
          {queuedToStarted && (
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex justify-center w-2">
                <span className="w-px h-8 bg-[#353432]" />
              </div>
              <p className="font-mono text-sm text-[#555555]">
                {queuedToStarted}
              </p>
            </div>
          )}

          {/* Started */}
          {job.started_at && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="rounded-full w-2 h-2 shrink-0 bg-[#555555]" />
                </div>
                <p className="text-sm text-[#A1A1AA]">Started</p>
                <p className="ml-auto text-sm text-[#A1A1AA]">
                  {formatDate(job.started_at)}
                </p>
              </div>

              {/* Execution duration */}
              {startedToCompleted && (
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex justify-center w-2">
                    <span className="w-px h-8 bg-[#353432]" />
                  </div>
                  <p className="font-mono text-sm text-[#555555]">
                    {startedToCompleted}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Completed */}
          {job.completed_at && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`rounded-full w-2 h-2 shrink-0 ${completedDotClass}`}
                />
              </div>
              <p className="text-sm text-[#A1A1AA]">Completed</p>
              <p className="ml-auto text-sm text-[#A1A1AA]">
                {formatDate(job.completed_at)}
              </p>
            </div>
          )}
        </div>

        {/* Attempts */}
        <div className="mb-6">
          <p className="mb-1 text-sm text-[#71717A]">Attempts</p>
          <p className="text-base text-[#DCDCDC]">
            {job.attempts}/{job.max_attempts}
          </p>
        </div>

        {/* Error */}
        {job.last_error && (
          <div className="mb-6">
            <p className="mb-2 text-sm text-[#71717A]">Error</p>
            <div className="px-4 py-3 rounded-lg text-sm bg-[#201F1D] text-[#EF4444]">
              {job.last_error}
            </div>
          </div>
        )}

        {/* Payload */}
        <div>
          <p className="mb-2 font-medium text-sm text-[#A1A1AA]">Payload</p>
          <pre
            className="px-4 py-3 rounded-lg overflow-x-auto text-xs font-mono bg-[#201F1D] text-[#A1A1AA]"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: input is our own JSON.stringify output, escaped via escapeHtml
            dangerouslySetInnerHTML={{ __html: colorizeJson(job.payload) }}
          />
        </div>
      </div>
    </>
  );
};
