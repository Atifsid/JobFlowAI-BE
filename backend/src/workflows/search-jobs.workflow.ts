import { JobSearch } from "../models/job-search.model";
import { Dashboard } from "../models/dashboard.model";
import { JobPipeline } from "../models/job-pipeline.model";
import { JobStatus } from "../models/job-status.model";
import { JobProvider } from "../services/jobs/job-provider.types";
import jobspediaProvider from "../services/jobs/providers/jobspedia/jobspedia.service";
import greenhouseProvider from "../services/jobs/providers/greenhouse/greenhouse.service";
import dashboardService from "../services/dashboard/dashboard.service";
import { Workflow } from "../types/workflow";
import cache from "../services/jobs/job-cache.service";

const providers: JobProvider[] = [jobspediaProvider, greenhouseProvider];

// Search is a pure local operation: fetch + cache, nothing else. No
// fit-scoring happens here - the master resume is a content pool for
// generated resumes, not something to grade postings against. External
// APIs (Sheets/Drive/LinkedIn/AI) only run when the user explicitly runs
// the pipeline on a job (resume.workflow.ts / generate-referral.workflow.ts),
// capped at 5 jobs per batch from the frontend - that's what keeps search
// clear of Google API quota errors.
class SearchJobsWorkflow implements Workflow<JobSearch, Dashboard> {
  async run(search: JobSearch): Promise<Dashboard> {
    try {
      const results = await Promise.all(
        providers.map(provider => provider.search(search))
      );
      const jobs = results.flatMap(r => r.jobs);
      const totalMatches = results.reduce((sum, r) => sum + r.total, 0);

      const pipeline: JobPipeline[] = [];

      for (const job of jobs) {
        // A job re-surfacing in a later search must not reset progress
        // the pipeline already made on it (e.g. REFERRAL_READY).
        const existing = await cache.getPipeline(job.id);
        const item: JobPipeline = {
          job,
          status: existing?.status ?? JobStatus.DISCOVERED
        };
        await cache.save(item);
        pipeline.push(item);
      }

      return dashboardService.build(pipeline, {
        page: search.page ?? 1,
        limit: search.limit ?? 20,
        totalMatches
      });
    } catch (error) {
      console.error("Error occurred while searching jobs:", error);
      throw error;
    }
  }
}

export default new SearchJobsWorkflow();
