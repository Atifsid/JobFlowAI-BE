import { JobSearch } from "../models/job-search.model";
import { Dashboard } from "../models/dashboard.model";
import hirebaseService from "../services/hirebase/hirebase.service";
import pipelineService from "../services/jobs/job-pipeline.service";
import dashboardService from "../services/dashboard/dashboard.service";
import sheetsService from "../services/sheets/sheets.service";
import { Workflow } from "../types/workflow";
import { toSheetRow } from "../services/sheets/job-record.mapper";

class SearchJobsWorkflow implements Workflow<JobSearch, Dashboard> {
  async run(search: JobSearch): Promise<Dashboard> {
    const result = await hirebaseService.searchJobs(search);

    const newJobs = [];

    for (const job of result.jobs) {
      if (await sheetsService.exists(job.id)) continue;
      newJobs.push(job);
    }

    const pipeline = await pipelineService.runMany(newJobs);

    for (const job of pipeline) {
      await sheetsService.upsert(job.job.id, toSheetRow(job));
    }

    return dashboardService.build(pipeline);
  }
}

export default new SearchJobsWorkflow();