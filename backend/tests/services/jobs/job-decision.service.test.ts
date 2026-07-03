import { describe, it, expect } from "vitest";
import decisionService from "../../../src/services/jobs/job-decision.service";
import { ResumeScore } from "../../../src/models/resume-score.model";

const scoreOf = (score: number): ResumeScore => ({
  score,
  missingSkills: [],
  strengths: [],
  weaknesses: [],
  recommendation: ""
});

describe("JobDecisionService.decide", () => {
  it("returns REFERRAL at or above 90", () => {
    expect(decisionService.decide(scoreOf(90))).toBe("REFERRAL");
    expect(decisionService.decide(scoreOf(100))).toBe("REFERRAL");
  });

  it("returns DIRECT_APPLY between 75 and 89", () => {
    expect(decisionService.decide(scoreOf(75))).toBe("DIRECT_APPLY");
    expect(decisionService.decide(scoreOf(89))).toBe("DIRECT_APPLY");
  });

  it("returns SKIP below 75", () => {
    expect(decisionService.decide(scoreOf(74))).toBe("SKIP");
    expect(decisionService.decide(scoreOf(0))).toBe("SKIP");
  });
});
