import { Job } from "../../models/job.model";
import { JobPipeline } from "../../models/job-pipeline.model";
import decisionService from "./job-decision.service";
import plannerService from "./job-planner.service";
import { JobStatus } from "../../models/job-status.model";
import matcher from "./job-matcher.service";

class JobPipelineService {
  async run(job: Job): Promise<JobPipeline> {
    const score = matcher.match(job);
    const decision = decisionService.decide(score);
    const actions = plannerService.plan(score, decision);

    return {
      job,
      score,
      decision,
      actions,
      status: JobStatus.ANALYZED
    };
  }

  async runMany(jobs: Job[]) {
    return Promise.all(jobs.map(job => this.run(job)));
  }
}

export default new JobPipelineService();
