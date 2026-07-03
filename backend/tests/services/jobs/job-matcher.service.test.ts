import { describe, it, expect } from "vitest";
import matcher from "../../../src/services/jobs/job-matcher.service";
import { Job } from "../../../src/models/job.model";

const jobWithSkills = (skills: string[]): Job => ({
  id: "1",
  title: "Software Engineer",
  company: "Acme",
  location: "Remote",
  remote: true,
  description: "",
  skills,
  applyUrl: "https://example.com",
  source: "test"
});

describe("JobMatcherService.match", () => {
  it("scores 100 when every job skill matches the master skill list", () => {
    const job = jobWithSkills(["React", "TypeScript"]);

    const result = matcher.match(job);

    expect(result.score).toBe(100);
    expect(result.missingSkills).toEqual([]);
    expect(result.recommendation).toBe("Apply");
  });

  it("scores 0 and lists every skill as missing when nothing matches", () => {
    const job = jobWithSkills(["COBOL", "Fortran"]);

    const result = matcher.match(job);

    expect(result.score).toBe(0);
    expect(result.missingSkills).toEqual(["COBOL", "Fortran"]);
    expect(result.recommendation).toBe("Skip");
  });

  it("is case-insensitive when matching skills", () => {
    const job = jobWithSkills(["react", "typescript"]);

    const result = matcher.match(job);

    expect(result.score).toBe(100);
  });

  it("scores 0 when the job has no listed skills", () => {
    const job = jobWithSkills([]);

    const result = matcher.match(job);

    expect(result.score).toBe(0);
  });

  it("matches skills spanning the former SDE/React/React Native lists", () => {
    const job = jobWithSkills(["React Native", "Kotlin", "Angular"]);

    const result = matcher.match(job);

    expect(result.score).toBe(100);
  });
});
