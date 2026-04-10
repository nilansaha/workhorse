import { WorkhorseDashboard } from "~/components/workhorse/dashboard";
import type { Job } from "~/components/workhorse/data";
import { getScheduledJobs } from "~/src/queries";

const ScheduledPage = async () => {
  let realJobs: Job[] = [];
  try {
    const rows = await getScheduledJobs(50);
    realJobs = rows as unknown as Job[];
  } catch (e) {
    console.error("workhorse: failed to load scheduled jobs", e);
  }
  return <WorkhorseDashboard realJobs={realJobs} />;
};

export default ScheduledPage;
