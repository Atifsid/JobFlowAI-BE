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
    const jobs = await pipelineService.runMany(result.jobs);
    for (const job of jobs) {
      await sheetsService.upsert(job.job.id, toSheetRow(job));
    }
    return dashboardService.build(jobs);
  }
}

export default new SearchJobsWorkflow();