import storage from "../storage/storage.service";
import { Job } from "../../models/job.model";
import { JobPipeline } from "../../models/job-pipeline.model";
import { JobStatus, statusRank } from "../../models/job-status.model";

class JobCacheService {
  async save(pipeline: JobPipeline) {
    await storage.write("jobs", `${pipeline.job.id}.json`, pipeline);
  }

  async get(id: string): Promise<Job | null> {
    const pipeline = await this.getPipeline(id);
    return pipeline?.job ?? null;
  }

  async getPipeline(id: string): Promise<JobPipeline | null> {
    const raw = await storage.read<JobPipeline>("jobs", `${id}.json`);
    return raw?.job ? this.normalize(raw) : null;
  }

  async exists(id: string) {
    return storage.exists("jobs", `${id}.json`);
  }

  async getAll(): Promise<JobPipeline[]> {
    const pipelines = await storage.readAll<JobPipeline>("jobs");
    return pipelines
      .filter((p): p is JobPipeline => Boolean(p?.job))
      .map(p => this.normalize(p));
  }

  // Moves a job's status forward, never backward - re-running resume
  // generation on a job that's already REFERRAL_READY must not demote it.
  // REJECTED/SKIPPED rank below the flow, so an explicit pipeline re-run
  // on a skipped job revives it.
  async advanceStatus(id: string, target: JobStatus): Promise<void> {
    const pipeline = await this.getPipeline(id);
    if (!pipeline) return;
    if (statusRank(target) > statusRank(pipeline.status)) {
      await this.save({ ...pipeline, status: target });
    }
  }

  // Cached files written before fetch-time scoring was removed carry
  // extra fields (score/decision/actions) and a retired ANALYZED status.
  // Rebuild the object so old entries read cleanly as the current shape.
  private normalize(raw: JobPipeline & { status?: string }): JobPipeline {
    const status = Object.values(JobStatus).includes(raw.status as JobStatus)
      ? (raw.status as JobStatus)
      : JobStatus.DISCOVERED;
    return { job: raw.job, status };
  }
}

export default new JobCacheService();
