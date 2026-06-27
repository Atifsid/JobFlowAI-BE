import { Job } from "../../models/job.model";
import { JobPipeline } from "../../models/job-pipeline.model";
import aiService from "../ai/ai.service";
import resumeService from "../resume/resume.service";
import decisionService from "./job-decision.service";
import plannerService from "./job-planner.service";
import { JobStatus } from "../../models/job-status.model";

class JobPipelineService {
  async run(job: Job): Promise<JobPipeline> {
    const resume = await resumeService.getMaster();
    const score = await aiService.scoreResume(job.description, resume.content);
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