import { JobSearch } from "../models/job-search.model";
import { Dashboard } from "../models/dashboard.model";
import { JobProvider } from "../services/jobs/job-provider.types";
import jobspediaProvider from "../services/jobs/providers/jobspedia/jobspedia.service";
import greenhouseProvider from "../services/jobs/providers/greenhouse/greenhouse.service";
import pipelineService from "../services/jobs/job-pipeline.service";
import dashboardService from "../services/dashboard/dashboard.service";
import sheetsService from "../services/sheets/sheets.service";
import { Workflow } from "../types/workflow";
import { toSheetRow } from "../services/sheets/job-record.mapper";
import cache from "../services/jobs/job-cache.service";

const providers: JobProvider[] = [jobspediaProvider, greenhouseProvider];

class SearchJobsWorkflow implements Workflow<JobSearch, Dashboard> {
  async run(search: JobSearch): Promise<Dashboard> {
    try {
      const results = await Promise.all(
        providers.map(provider => provider.search(search))
      );
      const jobs = results.flat();

      const newJobs = [];

      for (const job of jobs) {
        if (await sheetsService.exists(job.id)) continue;
        newJobs.push(job);
      }

      const pipeline = await pipelineService.runMany(newJobs);

      for (const item of pipeline) {
        await cache.save(item);
        await sheetsService.upsert(item.job.id, toSheetRow(item));
      }

      return dashboardService.build(pipeline);
    } catch (error) {
      console.error("Error occurred while searching jobs:", error);
      throw error;
    }
  }
}

export default new SearchJobsWorkflow();
