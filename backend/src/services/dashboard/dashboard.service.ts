import { Dashboard } from "../../models/dashboard.model";
import { JobPipeline } from "../../models/job-pipeline.model";
import { JobStatus, hasReached } from "../../models/job-status.model";

interface Pagination {
  page: number;
  limit: number;
  totalMatches: number;
}

class DashboardService {
  build(jobs: JobPipeline[], pagination?: Pagination): Dashboard {
    return {
      total: jobs.length,
      resumesGenerated: jobs.filter(j => hasReached(j.status, JobStatus.RESUME_GENERATED)).length,
      referralsReady: jobs.filter(j => hasReached(j.status, JobStatus.REFERRAL_READY)).length,
      applied: jobs.filter(j => hasReached(j.status, JobStatus.APPLIED)).length,
      jobs,
      page: pagination?.page,
      limit: pagination?.limit,
      totalMatches: pagination?.totalMatches
    };
  }
}

export default new DashboardService();
