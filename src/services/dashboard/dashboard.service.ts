import { Dashboard } from "../../models/dashboard.model";
import { JobPipeline } from "../../models/job-pipeline.model";

class DashboardService {
  build(jobs: JobPipeline[]): Dashboard {
    return {
      total: jobs.length,
      referral: jobs.filter(j => j.decision === "REFERRAL").length,
      directApply: jobs.filter(j => j.decision === "DIRECT_APPLY").length,
      skip: jobs.filter(j => j.decision === "SKIP").length,
      jobs
    };
  }
}

export default new DashboardService();