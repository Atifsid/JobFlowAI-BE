import { JobAction } from "../../models/job-action.model";
import { JobDecision } from "../../models/job-decision.model";
import { ResumeScore } from "../../models/resume-score.model";

class JobPlannerService {
  plan(score: ResumeScore, decision: JobDecision): JobAction[] {
    switch (decision) {
      case "REFERRAL":
        return [
          JobAction.GENERATE_RESUME,
          JobAction.FIND_EMPLOYEES,
          JobAction.GENERATE_REFERRAL
        ];
      case "DIRECT_APPLY":
        return [
          JobAction.GENERATE_RESUME,
          JobAction.GENERATE_COVER_LETTER,
          JobAction.APPLY
        ];
      default:
        return [JobAction.SKIP];
    }
  }
}

export default new JobPlannerService();