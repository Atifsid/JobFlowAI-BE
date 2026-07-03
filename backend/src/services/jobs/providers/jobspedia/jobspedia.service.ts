import axios from "axios";
import { env } from "../../../../config/env";
import { JobSearch } from "../../../../models/job-search.model";
import { JobProvider, JobSearchResult } from "../../job-provider.types";
import { JobspediaJob, mapJobspediaJob } from "./jobspedia.mapper";

interface JobspediaSearchResponse {
  jobs: JobspediaJob[];
  page: number;
  count: number;
  total: number;
}

// jobspedia (a sibling local project) merges ATS-direct (Greenhouse/Lever/Ashby)
// and aggregator (LinkedIn/Indeed/Glassdoor/...) postings into one deduped
// dataset, replacing HireBase as the job source. It's a local read API with
// no auth - just JOBSPEDIA_BASE_URL.
class JobspediaService implements JobProvider {
  private api = axios.create({
    baseURL: env.JOBSPEDIA_BASE_URL,
    headers: { "Content-Type": "application/json" }
  });

  async search(search: JobSearch): Promise<JobSearchResult> {
    const { data } = await this.api.post<JobspediaSearchResponse>("/jobs/search", {
      title: search.title,
      keywords: search.keywords,
      company: search.company,
      remote: search.remote,
      city: search.city,
      region: search.region,
      country: search.country,
      seniority: search.seniority,
      minSalary: search.minSalary,
      maxSalary: search.maxSalary,
      daysAgo: search.daysAgo,
      page: search.page,
      limit: search.limit
    });

    return { jobs: data.jobs.map(mapJobspediaJob), total: data.total };
  }
}

export default new JobspediaService();
