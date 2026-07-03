import { Dashboard } from "../../models/dashboard.model";
import { JobPipeline } from "../../models/job-pipeline.model";

interface Pagination {
  page: number;
  limit: number;
  totalMatches: number;
}

class DashboardService {
  build(jobs: JobPipeline[], pagination?: Pagination): Dashboard {
    return {
      total: jobs.length,
      referral: jobs.filter(j => j.decision === "REFERRAL").length,
      directApply: jobs.filter(j => j.decision === "DIRECT_APPLY").length,
      skip: jobs.filter(j => j.decision === "SKIP").length,
      jobs,
      page: pagination?.page,
      limit: pagination?.limit,
      totalMatches: pagination?.totalMatches
    };
  }
}

export default new DashboardService();
