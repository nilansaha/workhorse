import { AnalyticsView, type JobStat } from "~/components/workhorse/analytics";
import { getJobStats } from "~/src/queries";

const AnalyticsPage = async () => {
  let stats: JobStat[] = [];
  try {
    const rows = await getJobStats();
    stats = rows as unknown as JobStat[];
  } catch (e) {
    console.error("workhorse: failed to load stats", e);
  }
  return <AnalyticsView stats={stats} />;
};

export default AnalyticsPage;
