import { JobPipeline } from "../models/job-pipeline.model";
import { JobStatus } from "../models/job-status.model";
import cache from "../services/jobs/job-cache.service";
import sheetsService from "../services/sheets/sheets.service";
import { toSheetRow } from "../services/sheets/job-record.mapper";
import { Workflow } from "../types/workflow";

interface UpdateJobStatusInput {
  jobId: string;
  status: JobStatus;
}

class UpdateJobStatusWorkflow implements Workflow<UpdateJobStatusInput, JobPipeline> {
  async run({ jobId, status }: UpdateJobStatusInput): Promise<JobPipeline> {
    const pipeline = await cache.getPipeline(jobId);
    if (!pipeline) throw new Error(`No cached job found for id ${jobId}`);

    const updated: JobPipeline = { ...pipeline, status };
    await cache.save(updated);
    await sheetsService.upsert(updated.job.id, toSheetRow(updated));

    return updated;
  }
}

export default new UpdateJobStatusWorkflow();
