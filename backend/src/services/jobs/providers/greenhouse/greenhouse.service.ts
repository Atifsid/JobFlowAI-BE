import axios from "axios";
import { Job } from "../../../../models/job.model";
import { JobSearch } from "../../../../models/job-search.model";
import { JobProvider, JobSearchResult } from "../../job-provider.types";
import { GreenhouseJob, mapGreenhouseJob } from "./greenhouse.mapper";
import { env } from "../../../../config/env";

// Greenhouse's public job board API (boards-api.greenhouse.io) needs no
// auth and is meant for exactly this kind of consumption, but it's
// per-company (a "board token", e.g. "stripe") rather than a general
// keyword search across all companies - so board tokens are configured
// via GREENHOUSE_BOARD_TOKENS and results are filtered client-side.
class GreenhouseProvider implements JobProvider {
  async search(search: JobSearch): Promise<JobSearchResult> {
    const tokens = this.boardTokens();
    if (tokens.length === 0) return { jobs: [], total: 0 };

    const boards = await Promise.all(
      tokens.map(token => this.fetchBoard(token))
    );

    const jobs = boards.flat().filter(job => this.matches(job, search));
    return { jobs, total: jobs.length };
  }

  private boardTokens(): string[] {
    return env.GREENHOUSE_BOARD_TOKENS.split(",")
      .map(token => token.trim())
      .filter(Boolean);
  }

  private async fetchBoard(token: string): Promise<Job[]> {
    const { data } = await axios.get(
      `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`,
      { params: { content: true } }
    );

    const jobs: GreenhouseJob[] = data.jobs ?? [];
    return jobs.map(job => mapGreenhouseJob(job, token));
  }

  private matches(job: Job, search: JobSearch): boolean {
    if (search.title && !job.title.toLowerCase().includes(search.title.toLowerCase())) {
      return false;
    }
    if (search.remote && !job.remote) return false;
    return true;
  }
}

export default new GreenhouseProvider();
