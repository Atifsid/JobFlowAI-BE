import axios from "axios";
import { env } from "../../config/env";
import { JobSearch } from "../../models/job-search.model";
import { mapHireBaseJob } from "./hirebase.mapper";

class HireBaseService {
  private api = axios.create({
    baseURL: "https://api.hirebase.org/v2",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.HIREBASE_API_KEY
    }
  });

  async searchJobs(search: JobSearch) {
    const { data } = await this.api.post("/jobs/search", {
      job_titles: [search.title],
      keywords: search.keywords,
      location_types: search.remote ? ["Remote"] : undefined,
      geo_locations: search.country ? [{ city: search.city, region: search.region, country: search.country }] : undefined,
      experience: search.experience,
      page: search.page ?? 1,
      limit: search.limit ?? 5,
      return_raw_description: "true",
      include_no_salary: "true"
    });

    return {
      ...data,
      jobs: data.jobs.map(mapHireBaseJob)
    };
  }
}

export default new HireBaseService();