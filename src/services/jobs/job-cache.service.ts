import storage from "../storage/storage.service";
import { Job } from "../../models/job.model";
import { JobPipeline } from "../../models/job-pipeline.model";

class JobCacheService {
  async save(pipeline: JobPipeline) {
    await storage.write("jobs", `${pipeline.job.id}.json`, pipeline);
  }

  async get(id: string): Promise<Job | null> {
    const pipeline = await storage.read<JobPipeline>("jobs", `${id}.json`);
    return pipeline?.job ?? null;
  }

  async getPipeline(id: string): Promise<JobPipeline | null> {
    return storage.read<JobPipeline>("jobs", `${id}.json`);
  }

  async exists(id: string) {
    return storage.exists("jobs", `${id}.json`);
  }

  async getAll(): Promise<JobPipeline[]> {
    const pipelines = await storage.readAll<JobPipeline>("jobs");
    return pipelines.filter((p): p is JobPipeline => Boolean(p?.job && p?.score));
  }
}

export default new JobCacheService();