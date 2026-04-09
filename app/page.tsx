import { WorkhorseDashboard } from "~/components/workhorse/dashboard";
import type { Job } from "~/components/workhorse/data";
import { getRecentJobs } from "~/src/queries";

const WorkhorsePage = async () => {
  let realJobs: Job[] = [];
  try {
    const rows = await getRecentJobs(50);
    realJobs = rows as unknown as Job[];
  } catch (e) {
    console.error("workhorse: failed to load real jobs", e);
  }
  return <WorkhorseDashboard realJobs={realJobs} />;
};

export default WorkhorsePage;
