import { Job } from "../../models/job.model";
import { JobPipeline } from "../../models/job-pipeline.model";
import resumeService from "../resume/resume.service";
import decisionService from "./job-decision.service";
import plannerService from "./job-planner.service";
import { JobStatus } from "../../models/job-status.model";
import selector from "../resume/selector/resume-selector.service";
import matcher from "./job-matcher.service";

class JobPipelineService {
  async run(job: Job): Promise<JobPipeline> {
    const template = selector.select(job.description);
    const resume = await resumeService.getTemplate(template);
    const score = matcher.match(job, template);
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