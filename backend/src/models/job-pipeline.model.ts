import { Job } from "./job.model";
import { ResumeScore } from "./resume-score.model";
import { JobDecision } from "./job-decision.model";
import { JobAction } from "./job-action.model";
import { JobStatus } from "./job-status.model";

export interface JobPipeline {
  job: Job;
  score: ResumeScore;
  decision: JobDecision;
  actions: JobAction[];
  status: JobStatus;
}