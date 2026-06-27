import { ResumeScore } from "../../models/resume-score.model";
import { JobDecision } from "../../models/job-decision.model";

class JobDecisionService {
  decide(score: ResumeScore): JobDecision {
    if (score.score >= 90) return "REFERRAL";
    if (score.score >= 75) return "DIRECT_APPLY";
    return "SKIP";
  }
}

export default new JobDecisionService();