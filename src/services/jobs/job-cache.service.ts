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

  async exists(id: string) {
    return storage.exists("jobs", `${id}.json`);
  }

  async getAll(): Promise<JobPipeline[]> {
    return storage.readAll<JobPipeline>("jobs");
  }
}

export default new JobCacheService();