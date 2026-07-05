import { describe, it, expect } from "vitest";
import resumeFitService from "../../../../src/services/resume/fit/resume-fit.service";

const role = (name: string, bullets: number) =>
  [`**${name}** | Acme | 2024`, ...Array.from({ length: bullets }, (_, i) => `- ${name} bullet ${i + 1}`)].join("\n");

const project = (name: string, bullets: number) =>
  [`**${name}** — React`, ...Array.from({ length: bullets }, (_, i) => `- ${name} bullet ${i + 1}`)].join("\n");

describe("ResumeFitService.enforceBudgets", () => {
  it("caps skills at 7 lines, bullets at 5/role and 20 total, projects at 4x3", () => {
    const sections = resumeFitService.enforceBudgets({
      skills: Array.from({ length: 9 }, (_, i) => `Category ${i}: things`).join("\n"),
      experience: [role("A", 6), role("B", 6), role("C", 6), role("D", 6)].join("\n\n"),
      projects: [project("P1", 4), project("P2", 4), project("P3", 4), project("P4", 4), project("P5", 4)].join(
        "\n\n"
      )
    });

    expect(sections.skills.split("\n")).toHaveLength(7);
    expect(sections.experience.match(/^- /gm)).toHaveLength(20);
    // Every role survives, each with at most 5 bullets.
    expect(sections.experience.match(/^\*\*/gm)).toHaveLength(4);
    expect(sections.projects.match(/^\*\*/gm)).toHaveLength(4);
    expect(sections.projects.match(/^- /gm)).toHaveLength(12);
  });

  it("shaves the total-bullet overage from the oldest (last-listed) role first", () => {
    const sections = resumeFitService.enforceBudgets({
      skills: "Languages: things",
      experience: [role("Newest", 5), role("Mid", 5), role("Mid2", 5), role("Oldest", 5)].join("\n\n"),
      projects: project("P1", 1)
    });

    // 4 roles x 5 = 20, already at budget - all keep 5.
    expect(sections.experience.match(/^- /gm)).toHaveLength(20);

    const five = resumeFitService.enforceBudgets({
      skills: "Languages: things",
      experience: [role("Newest", 5), role("Mid", 5), role("Mid2", 5), role("Old", 5), role("Oldest", 5)].join(
        "\n\n"
      ),
      projects: project("P1", 1)
    });

    // 5 roles x 5 = 25 -> 20: Oldest loses 4 (down to 1), Old loses 1.
    expect(five.experience.match(/^- /gm)).toHaveLength(20);
    expect(five.experience.split("**Oldest**")[1].match(/^- /gm)).toHaveLength(1);
    expect(five.experience.split("**Old**")[1].split("**Oldest**")[0].match(/^- /gm)).toHaveLength(4);
    expect(five.experience.split("**Newest**")[1].split("**Mid**")[0].match(/- /g)).toHaveLength(5);
  });
});

describe("ResumeFitService.enforceBudgets - skill line sanitization", () => {
  it("drops a skills line that isn't a real category: skill-list entry", () => {
    const sections = resumeFitService.enforceBudgets({
      skills: [
        "Languages: JavaScript, TypeScript",
        "Testing: Testing (mentioned in project experience)",
        "Backend: Node.js"
      ].join("\n"),
      experience: role("A", 1),
      projects: project("P1", 1)
    });

    expect(sections.skills).not.toContain("mentioned in project experience");
    expect(sections.skills.split("\n")).toEqual(["Languages: JavaScript, TypeScript", "Backend: Node.js"]);
  });

  it("drops a skills line where the value just repeats the category name", () => {
    const sections = resumeFitService.enforceBudgets({
      skills: ["Languages: JavaScript", "Testing: Testing"].join("\n"),
      experience: role("A", 1),
      projects: project("P1", 1)
    });

    expect(sections.skills).toBe("Languages: JavaScript");
  });
});

describe("ResumeFitService.growOneStep", () => {
  it("restores experience bullets first, for the roles missing the most compared to the master", () => {
    const master = {
      skills: "L1: a",
      experience: [role("New", 3), role("Old", 3)].join("\n\n"),
      projects: project("P1", 1)
    };
    const tailored = {
      skills: "L1: a",
      experience: [role("New", 1), role("Old", 1)].join("\n\n"),
      projects: project("P1", 1)
    };

    const grown = resumeFitService.growOneStep(tailored, master)!;

    expect(grown.experience.split("**New**")[1].split("**Old**")[0].match(/^- /gm)).toHaveLength(2);
  });

  it("restores skill lines once experience bullets are already at the per-role cap", () => {
    const master = {
      skills: ["L1: a", "L2: b", "L3: c"].join("\n"),
      experience: role("New", 5),
      projects: project("P1", 1)
    };
    const tailored = {
      skills: "L1: a",
      experience: role("New", 5),
      projects: project("P1", 1)
    };

    const grown = resumeFitService.growOneStep(tailored, master)!;

    expect(grown.skills.split("\n")).toEqual(["L1: a", "L2: b"]);
  });

  it("restores project bullets, then adds a whole unused project, once skills and experience are maxed", () => {
    const maxedSkills = Array.from({ length: 7 }, (_, i) => `L${i}: x`).join("\n");
    const master = {
      skills: maxedSkills,
      experience: role("New", 5),
      projects: [project("P1", 3), project("P2", 3)].join("\n\n")
    };
    const tailored = {
      skills: maxedSkills,
      experience: role("New", 5),
      projects: project("P1", 1)
    };

    let grown = resumeFitService.growOneStep(tailored, master)!;
    expect(grown.projects.match(/^- /gm)).toHaveLength(2); // P1's 2nd bullet restored

    grown = resumeFitService.growOneStep(grown, master)!;
    expect(grown.projects.match(/^- /gm)).toHaveLength(3); // P1's 3rd bullet restored

    grown = resumeFitService.growOneStep(grown, master)!;
    expect(grown.projects.match(/^\*\*/gm)).toHaveLength(2); // P2 added
  });

  it("returns null once the tailored sections already match the master pool", () => {
    const sections = { skills: "L1: a", experience: role("New", 1), projects: project("P1", 1) };

    expect(resumeFitService.growOneStep(sections, sections)).toBeNull();
  });

  it("does not re-add a master bullet whose content the model already reworded into an existing bullet", () => {
    // Observed live: growing by master index re-added "Designed
    // Integrations BE, a gateway enabling partner order creation and
    // onboarding beyond MedCart" as a near-duplicate of a tailored bullet
    // that had already reworded the same fact with an extra clause.
    const master = {
      skills: "L1: a",
      experience: [
        "**Senior Developer** | Localwell | 2026",
        "- Lead full-stack development of MedCart, an e-commerce platform.",
        "- Designed Integrations BE, a gateway enabling partner order creation and onboarding beyond MedCart."
      ].join("\n"),
      projects: project("P1", 1)
    };
    const tailored = {
      skills: "L1: a",
      experience: [
        "**Senior Developer** | Localwell | 2026",
        "- Lead full-stack development of MedCart, an e-commerce platform, using React for the frontend.",
        "- Designed Integrations BE, a gateway enabling partner order creation and onboarding beyond MedCart, utilizing Zustand for state management."
      ].join("\n"),
      projects: project("P1", 1)
    };

    const grown = resumeFitService.growOneStep(tailored, master);

    // Both master bullets are already reworded into the tailored section,
    // and no other section has anything left to grow, so there's nothing
    // left to add.
    expect(grown).toBeNull();
  });

  it("does not re-add the master bullet when the model's version is a condensed subset of it", () => {
    // Observed live twice: the model DROPPED a trailing clause rather than
    // adding one, e.g. keeping only "Developed a .NET Web API for the Job
    // Sheet module in a Fleet Management System." from the master's fuller
    // "...supporting maintenance operations for 100+ vehicles." The old
    // overlap check divided by the CANDIDATE's (master's, longer) word
    // count, so this scored exactly 0.6 and slipped through a ">" check.
    const master = {
      skills: "L1: a",
      experience: [
        "**Software Developer** | Beta Arrays | 2025",
        "- Developed a .NET Web API for the Job Sheet module in a Fleet Management System, supporting maintenance operations for 100+ vehicles.",
        "- Refactored file storage logic by centralizing S3 directory usage with environment-based configuration, removing hardcoded paths."
      ].join("\n"),
      projects: project("P1", 1)
    };
    const tailored = {
      skills: "L1: a",
      experience: [
        "**Software Developer** | Beta Arrays | 2025",
        "- Developed a .NET Web API for the Job Sheet module in a Fleet Management System.",
        "- Refactored file storage logic using AWS S3 with environment-based configuration."
      ].join("\n"),
      projects: project("P1", 1)
    };

    expect(resumeFitService.growOneStep(tailored, master)).toBeNull();
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
