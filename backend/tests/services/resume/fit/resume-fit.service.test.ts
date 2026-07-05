import { describe, it, expect } from "vitest";
import resumeFitService from "../../../../src/services/resume/fit/resume-fit.service";

const role = (name: string, bullets: number) =>
  [`**${name}** | Acme | 2024`, ...Array.from({ length: bullets }, (_, i) => `- ${name} bullet ${i + 1}`)].join("\n");

const project = (name: string, bullets: number) =>
  [`**${name}** — React`, ...Array.from({ length: bullets }, (_, i) => `- ${name} bullet ${i + 1}`)].join("\n");

describe("ResumeFitService.enforceBudgets", () => {
  it("caps skills at 6 lines, bullets at 3/role and 12 total, projects at 2x2", () => {
    const sections = resumeFitService.enforceBudgets({
      skills: Array.from({ length: 8 }, (_, i) => `Category ${i}: things`).join("\n"),
      experience: [role("A", 5), role("B", 5), role("C", 5), role("D", 5)].join("\n\n"),
      projects: [project("P1", 3), project("P2", 3), project("P3", 3)].join("\n\n")
    });

    expect(sections.skills.split("\n")).toHaveLength(6);
    expect(sections.experience.match(/^- /gm)).toHaveLength(12);
    // Every role survives, each with at most 3 bullets.
    expect(sections.experience.match(/^\*\*/gm)).toHaveLength(4);
    expect(sections.projects.match(/^\*\*/gm)).toHaveLength(2);
    expect(sections.projects.match(/^- /gm)).toHaveLength(4);
  });

  it("shaves the total-bullet overage from the oldest (last-listed) role first", () => {
    const sections = resumeFitService.enforceBudgets({
      skills: "Languages: things",
      experience: [role("Newest", 3), role("Mid", 3), role("Mid2", 3), role("Oldest", 3)].join("\n\n"),
      projects: project("P1", 1)
    });

    // 4 roles x 3 = 12, already at budget - all keep 3.
    expect(sections.experience.match(/^- /gm)).toHaveLength(12);

    const five = resumeFitService.enforceBudgets({
      skills: "Languages: things",
      experience: [role("Newest", 3), role("Mid", 3), role("Mid2", 3), role("Old", 3), role("Oldest", 3)].join("\n\n"),
      projects: project("P1", 1)
    });

    // 5 roles x 3 = 15 -> 12: Oldest loses 2 (down to 1), Old loses 1.
    expect(five.experience.match(/^- /gm)).toHaveLength(12);
    expect(five.experience.split("**Oldest**")[1].match(/^- /gm)).toHaveLength(1);
    expect(five.experience.split("**Newest**")[1].split("**Mid**")[0].match(/- /g)).toHaveLength(3);
  });
});

describe("ResumeFitService.trimOneStep", () => {
  const base = {
    skills: ["L1: a", "L2: b", "L3: c", "L4: d", "L5: e"].join("\n"),
    experience: [role("New", 2), role("Old", 2)].join("\n\n"),
    projects: [project("P1", 2), project("P2", 2)].join("\n\n")
  };

  it("removes project bullets first, then the second project, then skills lines, then oldest-role bullets", () => {
    let s = resumeFitService.trimOneStep(base)!;
    expect(s.projects.match(/^- /gm)).toHaveLength(3); // P2 loses a bullet

    s = resumeFitService.trimOneStep(s)!;
    expect(s.projects.match(/^- /gm)).toHaveLength(2); // P1 loses a bullet

    s = resumeFitService.trimOneStep(s)!;
    expect(s.projects.match(/^\*\*/gm)).toHaveLength(1); // P2 dropped entirely

    s = resumeFitService.trimOneStep(s)!;
    expect(s.skills.split("\n")).toHaveLength(4); // skills 5 -> 4

    s = resumeFitService.trimOneStep(s)!;
    expect(s.experience.split("**Old**")[1].match(/- /g)).toHaveLength(1); // oldest role 2 -> 1

    s = resumeFitService.trimOneStep(s)!;
    expect(s.experience.split("**New**")[1].split("**Old**")[0].match(/- /g)).toHaveLength(1);

    // Minimum reached: 1 project x 1 bullet, 4 skill lines, 1 bullet per role.
    expect(resumeFitService.trimOneStep(s)).toBeNull();
  });
});
