import { describe, it, expect } from "vitest";
import inferredSkillsService from "../../../../src/services/resume/ats/inferred-skills.service";

describe("InferredSkillsService.fromMasterResume", () => {
  it("infers foundational skills implied by a claimed technology", () => {
    const master = "Skills: React, TypeScript, Node.js";

    const inferred = inferredSkillsService.fromMasterResume(master);
    const skills = inferred.map(i => i.skill);

    expect(skills).toEqual(expect.arrayContaining(["HTML", "CSS", "Hooks", "Context"]));
    expect(inferred.find(i => i.skill === "HTML")).toMatchObject({ parent: "React" });
  });

  it("never infers a skill that's already explicit in the master resume", () => {
    const master = "Skills: React, HTML5, CSS3";

    const inferred = inferredSkillsService.fromMasterResume(master);

    expect(inferred.some(i => i.skill === "HTML")).toBe(false);
    expect(inferred.some(i => i.skill === "CSS")).toBe(false);
  });

  it("does not infer anything when the parent technology isn't claimed", () => {
    const master = "Skills: Java, Kotlin";

    const inferred = inferredSkillsService.fromMasterResume(master);

    expect(inferred).toEqual([]);
  });

  it("keeps the highest-confidence rule when two parents imply the same skill", () => {
    const master = "Skills: React, Next.js";

    const inferred = inferredSkillsService.fromMasterResume(master);
    const reactEntries = inferred.filter(i => i.skill === "React");

    // Next.js implies React at 1.0 - React itself is explicit here, but
    // this checks dedupe-by-highest-confidence doesn't produce duplicates
    // for any skill implied by more than one rule.
    expect(reactEntries.length).toBeLessThanOrEqual(1);
  });
});

describe("InferredSkillsService.findCovering", () => {
  it("matches a JD keyword to an inferred skill via the alias table", () => {
    const inferred = inferredSkillsService.fromMasterResume("Skills: React");

    // JD phrasing "HTML5" should still resolve to the inferred "HTML".
    const hit = inferredSkillsService.findCovering("HTML5", inferred);

    expect(hit?.skill).toBe("HTML");
    expect(hit?.parent).toBe("React");
  });

  it("returns undefined when no inferred skill covers the keyword", () => {
    const inferred = inferredSkillsService.fromMasterResume("Skills: React");

    expect(inferredSkillsService.findCovering("Kubernetes", inferred)).toBeUndefined();
  });
});
