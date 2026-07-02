import axios from "axios";
import { env } from "../../../../config/env";
import { Job } from "../../../../models/job.model";
import { JobSearch } from "../../../../models/job-search.model";
import { JobProvider } from "../../job-provider.types";
import { JobspediaJob, mapJobspediaJob } from "./jobspedia.mapper";

interface JobspediaSearchResponse {
  jobs: JobspediaJob[];
  page: number;
  count: number;
}

// jobspedia (a sibling local project) merges ATS-direct (Greenhouse/Lever/Ashby)
// and aggregator (LinkedIn/Indeed/Glassdoor/...) postings into one deduped
// dataset, replacing HireBase as the job source. It's a local read API with no
// auth - just JOBSPEDIA_BASE_URL. `experience` on JobSearch is an array but
// jobspedia's endpoint only accepts a single string matched against the job
// title, so only the first entry is sent; minSalary/maxSalary/currency/
// jobTypes/visa/daysAgo/companyKeywords have no equivalent on jobspedia's side
// and are not sent (HireBase's own mapping had the same gap).
class JobspediaService implements JobProvider {
  private api = axios.create({
    baseURL: env.JOBSPEDIA_BASE_URL,
    headers: { "Content-Type": "application/json" }
  });

  async search(search: JobSearch): Promise<Job[]> {
    const { data } = await this.api.post<JobspediaSearchResponse>("/jobs/search", {
      title: search.title,
      keywords: search.keywords,
      remote: search.remote,
      city: search.city,
      region: search.region,
      country: search.country,
      experience: search.experience?.[0],
      page: search.page,
      limit: search.limit
    });

    return data.jobs.map(mapJobspediaJob);
  }
}

export default new JobspediaService();
