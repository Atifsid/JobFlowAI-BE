import { describe, it, expect } from "vitest";
import atsCheckService from "../../../../src/services/resume/ats/ats-check.service";

// A minimal stand-in for a Chromium PDF: page objects appear as plain
// "/Type /Page" dictionaries, exactly like Skia's real output.
const pdfWithPages = (n: number) =>
  Buffer.from(
    "%PDF-1.4\n" +
      "1 0 obj << /Type /Pages /Count " + n + " >> endobj\n" +
      Array.from({ length: n }, (_, i) => `${i + 2} 0 obj << /Type /Page >> endobj`).join("\n")
  );

const masterExperience = `**Senior Engineer** | Acme Corp | Jan 2024 – Present
- Did stuff.

**Engineer** | Beta Inc | Jan 2020 – Jan 2024
- Did other stuff.`;

const baseInput = {
  pdf: pdfWithPages(1),
  trueGaps: [] as string[],
  masterExperience,
  tailoredExperience: masterExperience
};

describe("AtsCheckService.evaluate", () => {
  it("passes when coverage is high, the PDF is one page, and no employer is missing", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "Built with React, TypeScript, Node.js and AWS.",
      keywords: ["React", "TypeScript", "Node.js", "AWS"]
    });

    expect(report).toEqual({
      score: 100,
      claimableCoverage: 100,
      matchedKeywords: ["React", "TypeScript", "Node.js", "AWS"],
      missingKeywords: [],
      trueGaps: [],
      pages: 1,
      missingEmployers: [],
      passed: true
    });
  });

  it("fails below 75% claimable coverage and lists the missing keywords", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "Built with React only.",
      keywords: ["React", "TypeScript", "Node.js", "AWS"]
    });

    expect(report.score).toBe(25);
    expect(report.claimableCoverage).toBe(25);
    expect(report.missingKeywords).toEqual(["TypeScript", "Node.js", "AWS"]);
    expect(report.passed).toBe(false);
  });

  it("scores fit over ALL keywords while gating only on the claimable ones", () => {
    // 2 claimable (both present) + 6 true gaps: the generator did all it
    // could (gate passes) but the fit score is honest about the JD.
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "React and TypeScript everywhere.",
      keywords: ["React", "TypeScript"],
      trueGaps: ["Python", "Go", "WPF", "Rust", "Scala", "Perl"]
    });

    expect(report.claimableCoverage).toBe(100);
    expect(report.score).toBe(25); // 2 of 8 total JD keywords
    expect(report.passed).toBe(true);
  });

  it("matches keywords case-insensitively but never inside a longer word", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "Expert in JavaScript and typescript.",
      keywords: ["Java", "TypeScript"]
    });

    // "Java" must not match inside "JavaScript".
    expect(report.matchedKeywords).toEqual(["TypeScript"]);
    expect(report.missingKeywords).toEqual(["Java"]);
  });

  it("handles keywords with regex specials and separators (CI/CD, Node.js)", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "Set up CI/CD pipelines with Node.js services.",
      keywords: ["CI/CD", "Node.js"]
    });

    expect(report.matchedKeywords).toEqual(["CI/CD", "Node.js"]);
  });

  it("fails when the PDF renders to more than one page", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      pdf: pdfWithPages(2),
      markdown: "React",
      keywords: ["React"]
    });

    expect(report.pages).toBe(2);
    expect(report.passed).toBe(false);
  });

  it("falls back to the page-tree /Count when no plain page objects are found", () => {
    const compressed = Buffer.from("%PDF-1.4\n1 0 obj << /Count 3 >> endobj");

    const report = atsCheckService.evaluate({
      ...baseInput,
      pdf: compressed,
      markdown: "React",
      keywords: ["React"]
    });

    expect(report.pages).toBe(3);
  });

  it("fails when the tailored Experience drops an employer", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "React",
      keywords: ["React"],
      tailoredExperience: "**Senior Engineer** | Acme Corp | Jan 2024 – Present\n- Did stuff."
    });

    expect(report.missingEmployers).toEqual(["Engineer | Beta Inc"]);
    expect(report.passed).toBe(false);
  });

  it("catches a dropped role even when another role at the same company survives", () => {
    // Observed live: with two roles at one company, the model dropped one
    // and a company-name-only check couldn't see it.
    const twoRolesSameCompany = `**Senior Engineer** | Acme Corp | Jan 2024 – Present
- Did stuff.

**Junior Engineer** | Acme Corp | Jan 2020 – Jan 2024
- Did earlier stuff.`;

    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "React",
      keywords: ["React"],
      masterExperience: twoRolesSameCompany,
      tailoredExperience: "**Senior Engineer** | Acme Corp | Jan 2024 – Present\n- Did stuff."
    });

    expect(report.missingEmployers).toEqual(["Junior Engineer | Acme Corp"]);
    expect(report.passed).toBe(false);
  });

  it("passes with score 0 when there are no claimable keywords - a poor-fit job isn't a generation failure", () => {
    const report = atsCheckService.evaluate({
      ...baseInput,
      markdown: "anything",
      keywords: [],
      trueGaps: ["Python", "WPF"]
    });

    expect(report.score).toBe(0);
    expect(report.trueGaps).toEqual(["Python", "WPF"]);
    expect(report.passed).toBe(true);
  });
});

describe("AtsCheckService.partitionClaimable", () => {
  it("splits keywords into those present in the master resume and true gaps", () => {
    const master = "Skills: React, TypeScript, Node.js";

    const { claimable, unclaimable } = atsCheckService.partitionClaimable(master, [
      "React",
      "Python",
      "TypeScript",
      "WPF"
    ]);

    expect(claimable).toEqual(["React", "TypeScript"]);
    expect(unclaimable).toEqual(["Python", "WPF"]);
  });

  it("uses whole-term matching: Java in the JD is a gap when the master only has JavaScript", () => {
    const { claimable, unclaimable } = atsCheckService.partitionClaimable(
      "Skills: JavaScript",
      ["Java"]
    );

    expect(claimable).toEqual([]);
    expect(unclaimable).toEqual(["Java"]);
  });
});
