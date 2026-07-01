import axios from "axios";
import { Job } from "../../../../models/job.model";
import { JobSearch } from "../../../../models/job-search.model";
import { JobProvider } from "../../job-provider.types";
import { GreenhouseJob, mapGreenhouseJob } from "./greenhouse.mapper";
import { env } from "../../../../config/env";

// Greenhouse's public job board API (boards-api.greenhouse.io) needs no
// auth and is meant for exactly this kind of consumption, but it's
// per-company (a "board token", e.g. "stripe") rather than a general
// keyword search across all companies - so board tokens are configured
// via GREENHOUSE_BOARD_TOKENS and results are filtered client-side.
class GreenhouseProvider implements JobProvider {
  async search(search: JobSearch): Promise<Job[]> {
    const tokens = this.boardTokens();
    if (tokens.length === 0) return [];

    const boards = await Promise.all(
      tokens.map(token => this.fetchBoard(token))
    );

    return boards.flat().filter(job => this.matches(job, search));
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
    const titleMatches = job.title
      .toLowerCase()
      .includes(search.title.toLowerCase());

    if (!titleMatches) return false;
    if (search.remote && !job.remote) return false;

    return true;
  }
}

export default new GreenhouseProvider();
