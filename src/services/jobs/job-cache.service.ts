import storage from "../storage/storage.service";
import { Job } from "../../models/job.model";

class JobCacheService {
  async save(job: Job) {
    await storage.write("jobs", `${job.id}.json`, job);
  }

  async get(id: string) {
    return storage.read<Job>("jobs", `${id}.json`);
  }

  async exists(id: string) {
    return storage.exists("jobs", `${id}.json`);
  }
}

export default new JobCacheService();