"use client";

export type JobStat = {
  job_name: string;
  total: number;
  done: number;
  failed: number;
  avg_duration_ms: number | null;
  min_duration_ms: number | null;
  max_duration_ms: number | null;
};

const formatDuration = (ms: number | null) => {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
};

export const AnalyticsView = ({ stats }: { stats: JobStat[] }) => {
  const totalJobs = stats.reduce((sum, s) => sum + s.total, 0);
  const totalDone = stats.reduce((sum, s) => sum + s.done, 0);
  const totalFailed = stats.reduce((sum, s) => sum + s.failed, 0);
  const successRate =
    totalDone + totalFailed === 0
      ? 0
      : Math.round((totalDone / (totalDone + totalFailed)) * 100);

  const summary = [
    { label: "Job types", value: stats.length },
    { label: "Total runs", value: totalJobs },
    { label: "Completed", value: totalDone },
    { label: "Success rate", value: `${successRate}%` },
  ];

  return (
    <div className="px-8 py-8 text-[#DCDCDC]">
      {/* Summary cards */}
      <div className="gap-4 grid grid-cols-4 mb-8">
        {summary.map((s) => (
          <div
            key={s.label}
            className="px-5 py-4 border border-[#252422] bg-[#191817] rounded-lg"
          >
            <p className="mb-1 text-xs text-[#71717A]">{s.label}</p>
            <p className="font-semibold text-2xl text-[#DCDCDC]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Stats table */}
      <div className="border border-[#252422] bg-[#191817] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#252422]">
              <th className="px-5 py-2.5 font-medium text-xs text-left text-[#71717A]">
                Job Name
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-right text-[#71717A]">
                Total
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-right text-[#71717A]">
                Done
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-right text-[#71717A]">
                Failed
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-right text-[#71717A]">
                Avg
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-right text-[#71717A]">
                Min
              </th>
              <th className="px-5 py-2.5 font-medium text-xs text-right text-[#71717A]">
                Max
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-sm text-[#71717A]"
                >
                  No job data yet.
                </td>
              </tr>
            )}
            {stats.map((s) => (
              <tr key={s.job_name} className="border-b border-[#252422]">
                <td className="px-5 py-2.5 font-medium">{s.job_name}</td>
                <td className="px-5 py-2.5 text-right text-[#DCDCDC]">
                  {s.total}
                </td>
                <td className="px-5 py-2.5 text-right text-[#4ABE78]">
                  {s.done}
                </td>
                <td
                  className={`px-5 py-2.5 text-right ${
                    s.failed > 0 ? "text-[#D95F5F]" : "text-[#A1A1AA]"
                  }`}
                >
                  {s.failed}
                </td>
                <td className="px-5 py-2.5 text-right text-[#A1A1AA]">
                  {formatDuration(s.avg_duration_ms)}
                </td>
                <td className="px-5 py-2.5 text-right text-[#A1A1AA]">
                  {formatDuration(s.min_duration_ms)}
                </td>
                <td className="px-5 py-2.5 text-right text-[#A1A1AA]">
                  {formatDuration(s.max_duration_ms)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
