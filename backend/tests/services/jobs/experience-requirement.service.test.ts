import { describe, it, expect } from "vitest";
import experienceRequirementService from "../../../src/services/jobs/experience-requirement.service";

describe("ExperienceRequirementService.extract", () => {
  it("parses an explicit range", () => {
    expect(experienceRequirementService.extract("Looking for 3-5 years of experience")).toEqual({
      min: 3,
      max: 5
    });
  });

  it("parses a range written with 'to'", () => {
    expect(experienceRequirementService.extract("2 to 4 years of experience required")).toEqual({
      min: 2,
      max: 4
    });
  });

  it("parses a range written with an en dash", () => {
    expect(experienceRequirementService.extract("3–5 years experience")).toEqual({ min: 3, max: 5 });
  });

  it("swaps a backwards range so min <= max", () => {
    expect(experienceRequirementService.extract("5-3 years experience")).toEqual({ min: 3, max: 5 });
  });

  it("parses 'minimum of N years' as an open-ended floor", () => {
    expect(experienceRequirementService.extract("minimum of 3 years of experience")).toEqual({ min: 3 });
  });

  it("parses 'at least N years' as an open-ended floor", () => {
    expect(experienceRequirementService.extract("at least 5 years in a similar role")).toEqual({ min: 5 });
  });

  it("parses 'N+ years' as an open-ended floor", () => {
    expect(experienceRequirementService.extract("3+ years of professional experience")).toEqual({ min: 3 });
  });

  it("parses a bare 'N years of experience' with no range or plus", () => {
    expect(experienceRequirementService.extract("2 years of experience with React")).toEqual({ min: 2 });
  });

  it("returns null when no years-of-experience phrase is present", () => {
    expect(
      experienceRequirementService.extract("We're building the future of fintech with a great team culture.")
    ).toBeNull();
  });

  it("prefers a range match over a bare/plus match elsewhere in the same text", () => {
    // Range checked first - the more specific, more informative signal.
    expect(
      experienceRequirementService.extract("2-4 years of experience, plus 10+ years in the industry overall")
    ).toEqual({ min: 2, max: 4 });
  });
});

describe("ExperienceRequirementService.resolve", () => {
  it("prefers years extracted from the JD text over any seniority fallback", () => {
    expect(experienceRequirementService.resolve("Looking for 3-5 years of experience", "principal")).toEqual({
      min: 3,
      max: 5
    });
  });

  it("falls back to a seniority estimate when the JD text is a one-sentence teaser with no years", () => {
    // Observed live: every Oracle Recruiting Cloud / JPMC posting in this
    // dataset has a short teaser description like this one - no years
    // mention at all - so relying on JD text alone let every "Lead"/
    // "Principal" title through a 3-4 year search regardless of the filter.
    expect(
      experienceRequirementService.resolve(
        "Carry out critical tech solutions across multiple technical areas as an integral part of an agile team",
        "lead"
      )
    ).toEqual({ min: 6, max: 15 });
    expect(
      experienceRequirementService.resolve(
        "Provide expertise and engineering excellence to enhance, build and deliver market-leading technologies",
        "principal"
      )
    ).toEqual({ min: 10 });
  });

  it("returns null when there's truly no signal - no JD years and no seniority label", () => {
    expect(experienceRequirementService.resolve("Join our growing team!", undefined)).toBeNull();
  });

  it("returns null for an unrecognized seniority value rather than guessing", () => {
    expect(experienceRequirementService.resolve("Join our growing team!", "some-unknown-value")).toBeNull();
  });
});

describe("ExperienceRequirementService.matches", () => {
  it("always matches when there's no extracted requirement - never excludes on missing data", () => {
    expect(experienceRequirementService.matches(null, { minYears: 2, maxYears: 4 })).toBe(true);
  });

  it("excludes a job whose minimum exceeds the target's maximum", () => {
    expect(experienceRequirementService.matches({ min: 5 }, { minYears: 2, maxYears: 4 })).toBe(false);
  });

  it("excludes a job whose maximum is below the target's minimum", () => {
    expect(experienceRequirementService.matches({ min: 0, max: 1 }, { minYears: 3, maxYears: 5 })).toBe(false);
  });

  it("matches an open-ended floor that falls within the target range", () => {
    expect(experienceRequirementService.matches({ min: 3 }, { minYears: 2, maxYears: 4 })).toBe(true);
  });

  it("matches an overlapping range even if it isn't fully contained", () => {
    expect(experienceRequirementService.matches({ min: 4, max: 6 }, { minYears: 2, maxYears: 5 })).toBe(true);
  });

  it("matches when no target range is given at all", () => {
    expect(experienceRequirementService.matches({ min: 8 }, {})).toBe(true);
  });
});
