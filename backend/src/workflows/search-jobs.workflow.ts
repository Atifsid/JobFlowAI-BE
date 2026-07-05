import { JobSearch } from "../models/job-search.model";
import { Dashboard } from "../models/dashboard.model";
import { JobProvider } from "../services/jobs/job-provider.types";
import jobspediaProvider from "../services/jobs/providers/jobspedia/jobspedia.service";
import greenhouseProvider from "../services/jobs/providers/greenhouse/greenhouse.service";
import pipelineService from "../services/jobs/job-pipeline.service";
import dashboardService from "../services/dashboard/dashboard.service";
import { Workflow } from "../types/workflow";
import cache from "../services/jobs/job-cache.service";

const providers: JobProvider[] = [jobspediaProvider, greenhouseProvider];

// Search is a pure local operation: fetch + score/decide/plan (job-pipeline.service
// is all in-process, no external API calls) + cache for later per-job lookups.
// It never touches Google Sheets/Drive/LinkedIn - those only run when the user
// explicitly runs the pipeline on a job (see resume.workflow.ts /
// generate-referral.workflow.ts), capped at 5 jobs per batch from the frontend.
// Keeping search free of external API calls is what avoids the Google API quota
// errors this used to hit when every search result triggered a Sheets write.
class SearchJobsWorkflow implements Workflow<JobSearch, Dashboard> {
  async run(search: JobSearch): Promise<Dashboard> {
    try {
      const results = await Promise.all(
        providers.map(provider => provider.search(search))
      );
      const jobs = results.flatMap(r => r.jobs);
      const totalMatches = results.reduce((sum, r) => sum + r.total, 0);

      const pipeline = await pipelineService.runMany(jobs);

      for (const item of pipeline) {
        await cache.save(item);
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
