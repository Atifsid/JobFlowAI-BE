import { Job } from "../../models/job.model";
import { JobSearch } from "../../models/job-search.model";

export interface JobProvider {
  search(search: JobSearch): Promise<Job[]>;
}
