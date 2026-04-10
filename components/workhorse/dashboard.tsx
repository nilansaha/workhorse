"use client";

import { useState } from "react";
import type { Job } from "./data";
import { JobDrawer } from "./drawer";

const statusClasses: Record<string, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-[rgba(161,161,170,0.08)] text-[#71717A]",
    dot: "bg-[#52525B]",
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

const formatTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDuration = (ms: number | null) => {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const dateOptions = [
  { value: "1h", label: "Last 1 hour", ms: 60 * 60 * 1000 },
  { value: "12h", label: "Last 12 hours", ms: 12 * 60 * 60 * 1000 },
  { value: "24h", label: "Last 24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "all", label: "All time", ms: null },
] as const;

const chevronDown = (
  <svg
    className="size-3 text-[#71717A]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

export const WorkhorseDashboard = ({ realJobs = [] }: { realJobs?: Job[] }) => {
  const [selected, setSelected] = useState<Job | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("any");
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("24h");
  const [dateOpen, setDateOpen] = useState(false);

  const jobs = [...realJobs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const dateOption =
    dateOptions.find((o) => o.value === dateFilter) ?? dateOptions[3];
  const dateCutoff = dateOption.ms === null ? null : Date.now() - dateOption.ms;
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== "any" && j.status !== statusFilter) return false;
    if (dateCutoff !== null && new Date(j.created_at).getTime() < dateCutoff)
      return false;
    return true;
  });

  const total = filteredJobs.length;
  const running = filteredJobs.filter((j) => j.status === "running").length;
  const done = filteredJobs.filter((j) => j.status === "done").length;
  const failed = filteredJobs.filter((j) => j.status === "failed").length;

  const stats = [
    { label: "Total", value: total },
    { label: "Running", value: running },
    { label: "Done", value: done },
    { label: "Failed", value: failed },
  ];

  return (
    <div className="px-8 py-8 text-[#DCDCDC]">
      {/* Stats */}
      <div className="gap-4 grid grid-cols-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="px-5 py-4 border border-[#252422] bg-[#191817] rounded-lg"
          >
            <p className="mb-1 text-xs text-[#71717A]">{s.label}</p>
            <p className="font-semibold text-2xl text-[#DCDCDC]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-end gap-3 mb-4">
        {/* Status filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen(!statusOpen)}
            className="inline-flex items-center gap-2 border border-[#252422] bg-[#191817] rounded-lg px-3 py-2 cursor-pointer transition-colors"
          >
            <span className="text-sm text-[#71717A]">Status:</span>
            <span className="text-sm font-medium text-[#DCDCDC]">
              {statusFilter === "any"
                ? "Any"
                : statusFilter === "done"
                  ? "Complete"
                  : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
            {chevronDown}
          </button>
          {statusOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setStatusOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-40 border border-[#252422] bg-[#191817] rounded-lg py-1 min-w-[140px]">
                {[
                  { value: "any", label: "Any" },
                  { value: "pending", label: "Pending" },
                  { value: "running", label: "Running" },
                  { value: "done", label: "Complete" },
                  { value: "failed", label: "Failed" },
                ].map((opt) => {
                  const active = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setStatusOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                        active
                          ? "bg-[#252422] text-[#DCDCDC]"
                          : "text-[#A1A1AA] hover:bg-[#1F1E1C]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Date filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDateOpen(!dateOpen)}
            className="inline-flex items-center gap-2 border border-[#252422] bg-[#191817] rounded-lg px-3 py-2 cursor-pointer transition-colors"
          >
            <span className="text-sm text-[#71717A]">Date:</span>
            <span className="text-sm font-medium text-[#DCDCDC]">
              {dateOption.label}
            </span>
            {chevronDown}
          </button>
          {dateOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDateOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-40 border border-[#252422] bg-[#191817] rounded-lg py-1 min-w-[160px]">
                {dateOptions.map((opt) => {
                  const active = dateFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDateFilter(opt.value);
                        setDateOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                        active
                          ? "bg-[#252422] text-[#DCDCDC]"
                          : "text-[#A1A1AA] hover:bg-[#1F1E1C]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#252422] bg-[#191817] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#252422]">
              <th className="px-5 py-2.5 font-medium text-xs text-left text-[#71717A]">
                Name
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-left text-[#71717A]">
                Status
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-left text-[#71717A]">
                Started
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-left text-[#71717A]">
                Duration
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-left text-[#71717A]">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-[#71717A]"
                >
                  No jobs match these filters.
                </td>
              </tr>
            )}
            {filteredJobs.map((job) => {
              const cls = statusClasses[job.status];
              return (
                <tr
                  key={job.id}
                  onClick={() => setSelected(job)}
                  className="transition-colors cursor-pointer border-b border-[#252422] hover:bg-[#1F1E1C]"
                >
                  <td className="px-5 py-2.5 font-medium">{job.job_name}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-[13px] ${cls.badge}`}
                    >
                      <span
                        className={`rounded-full w-1.5 h-1.5 ${cls.dot}`}
                      />
                      {job.status === "done"
                        ? "Complete"
                        : job.status === "running"
                          ? "Running"
                          : job.status.charAt(0).toUpperCase() +
                            job.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-[#A1A1AA]">
                    {formatTime(job.started_at)}
                  </td>
                  <td className="px-5 py-2.5 text-[#A1A1AA]">
                    {formatDuration(job.duration_ms)}
                  </td>
                  <td className="px-5 py-2.5 text-[#A1A1AA]">
                    {formatTime(job.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {selected && (
        <JobDrawer job={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};
