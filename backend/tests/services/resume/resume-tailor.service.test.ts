import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetMasterResume,
  mockSave,
  mockExtract,
  mockReplace,
  mockRender,
  mockTailorSkills,
  mockTailorExperience,
  mockTailorProjects,
  mockExtractKeywords,
  mockEvaluate,
  mockPartition,
  mockCountPages,
  mockEnforceBudgets,
  mockTrimOneStep,
  mockGrowOneStep,
  mockWarn
} = vi.hoisted(() => ({
  mockGetMasterResume: vi.fn(),
  mockSave: vi.fn(),
  mockExtract: vi.fn(),
  mockReplace: vi.fn(),
  mockRender: vi.fn(),
  mockTailorSkills: vi.fn(),
  mockTailorExperience: vi.fn(),
  mockTailorProjects: vi.fn(),
  mockExtractKeywords: vi.fn(),
  mockEvaluate: vi.fn(),
  mockPartition: vi.fn(),
  mockCountPages: vi.fn(),
  mockEnforceBudgets: vi.fn(),
  mockTrimOneStep: vi.fn(),
  mockGrowOneStep: vi.fn(),
  mockWarn: vi.fn()
}));

vi.mock("../../../src/services/resume/resume.service", () => ({
  default: { getMasterResume: mockGetMasterResume, save: mockSave }
}));

vi.mock("../../../src/services/resume/markdown/markdown.service", () => ({
  default: { extract: mockExtract, replace: mockReplace }
}));

vi.mock("../../../src/services/resume/pdf/pdf-render.service", () => ({
  default: { render: mockRender }
}));

vi.mock("../../../src/services/resume/ai/resume-ai.service", () => ({
  default: {
    extractKeywords: mockExtractKeywords,
    tailorSkills: mockTailorSkills,
    tailorExperience: mockTailorExperience,
    tailorProjects: mockTailorProjects
  }
}));

vi.mock("../../../src/services/resume/ats/ats-check.service", () => ({
  default: {
    evaluate: mockEvaluate,
    partitionClaimable: mockPartition,
    countPdfPages: mockCountPages
  }
}));

vi.mock("../../../src/services/resume/fit/resume-fit.service", () => ({
  default: { enforceBudgets: mockEnforceBudgets, trimOneStep: mockTrimOneStep, growOneStep: mockGrowOneStep }
}));

vi.mock("../../../src/config/logger", () => ({
  default: { warn: mockWarn }
}));

import resumeTailorService from "../../../src/services/resume/resume-tailor.service";
import { Job } from "../../../src/models/job.model";

const job: Job = {
  id: "1",
  title: "Software Engineer",
  company: "Acme",
  location: "Remote",
  remote: true,
  description: "job description",
  skills: [],
  applyUrl: "https://example.com",
  source: "test"
};

const passingReport = {
  score: 90,
  claimableCoverage: 100,
  matchedKeywords: ["React"],
  missingKeywords: [],
  trueGaps: ["Python"],
  pages: 1,
  missingEmployers: [],
  passed: true
};

describe("ResumeTailorService.generate", () => {
  beforeEach(() => {
    mockGetMasterResume.mockReset().mockResolvedValue("# master resume");
    mockSave.mockReset().mockResolvedValue("storage/resumes/generated/acme-software-engineer.pdf");
    mockExtract.mockReset().mockImplementation((_md: string, section: string) => `${section}-original`);
    mockReplace.mockReset().mockImplementation(
      (md: string, section: string, content: string) => `${md}+${section}:${content}`
    );
    mockRender.mockReset().mockResolvedValue(Buffer.from("pdf-bytes"));
    mockTailorSkills.mockReset().mockResolvedValue("skills!");
    mockTailorExperience.mockReset().mockResolvedValue("experience!");
    mockTailorProjects.mockReset().mockResolvedValue("projects!");
    mockExtractKeywords.mockReset().mockResolvedValue(["React", "Python"]);
    mockPartition.mockReset().mockReturnValue({ claimable: ["React"], unclaimable: ["Python"], inferred: [] });
    mockCountPages.mockReset().mockReturnValue(1);
    mockEnforceBudgets.mockReset().mockImplementation((s: unknown) => s);
    mockTrimOneStep.mockReset().mockReturnValue(null);
    mockGrowOneStep.mockReset().mockReturnValue(null);
    mockEvaluate.mockReset().mockReturnValue(passingReport);
    mockWarn.mockReset();
  });

  it("partitions keywords against the master and tailors with only the claimable ones", async () => {
    const result = await resumeTailorService.generate(job);

    expect(mockPartition).toHaveBeenCalledWith("# master resume", ["React", "Python"]);
    expect(mockTailorSkills).toHaveBeenCalledWith("Skills-original", ["React"], undefined);
    expect(mockTailorExperience).toHaveBeenCalledWith("Experience-original", ["React"], undefined);
    expect(mockTailorProjects).toHaveBeenCalledWith("Projects-original", ["React"], undefined);
    expect(mockEvaluate).toHaveBeenCalledWith(
      expect.objectContaining({ keywords: ["React"], trueGaps: ["Python"], inferredSkills: [] })
    );
    // Full extraction (including gaps) is still what's persisted upstream.
    expect(result.keywords).toEqual(["React", "Python"]);
    expect(result.ats).toEqual(passingReport);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining("true gaps"));
  });

  it("enforces content budgets in code before rendering", async () => {
    mockEnforceBudgets.mockReturnValue({
      skills: "trimmed-skills",
      experience: "trimmed-experience",
      projects: "trimmed-projects"
    });

    await resumeTailorService.generate(job);

    expect(mockEnforceBudgets).toHaveBeenCalledWith({
      skills: "skills!",
      experience: "experience!",
      projects: "projects!"
    });
    expect(mockRender).toHaveBeenCalledWith(
      "# master resume+Skills:trimmed-skills+Experience:trimmed-experience+Projects:trimmed-projects"
    );
  });

  it("trims one step at a time and re-renders until the PDF fits one page", async () => {
    mockCountPages
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(2)
      .mockReturnValueOnce(1);
    mockTrimOneStep
      .mockReturnValueOnce({ skills: "s2", experience: "e2", projects: "p2" })
      .mockReturnValueOnce({ skills: "s3", experience: "e3", projects: "p3" });

    await resumeTailorService.generate(job);

    expect(mockTrimOneStep).toHaveBeenCalledTimes(2);
    expect(mockRender).toHaveBeenCalledTimes(3);
    expect(mockRender).toHaveBeenLastCalledWith(
      "# master resume+Skills:s3+Experience:e3+Projects:p3"
    );
  });

  it("stops trimming when nothing is left to remove, keeping the over-length resume", async () => {
    mockCountPages.mockReturnValue(2);
    mockTrimOneStep.mockReturnValue(null);

    await resumeTailorService.generate(job);

    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining("minimum content"));
    expect(mockSave).toHaveBeenCalled();
  });

  it("grows content back one step at a time while the page has room, stopping before it overflows", async () => {
    // Initial render fits (1 page). First grow step still fits (1 page)
    // and is kept; second grow step overflows (2 pages) and is discarded,
    // so growOneStep is tried twice but only one growth survives.
    mockCountPages
      .mockReturnValueOnce(1) // initial render, exits trim loop immediately
      .mockReturnValueOnce(1) // grow loop's own condition check
      .mockReturnValueOnce(1) // first grown candidate still fits
      .mockReturnValueOnce(1) // grow loop re-checks, still <= 1
      .mockReturnValueOnce(2); // second grown candidate overflows - discarded
    mockGrowOneStep
      .mockReturnValueOnce({ skills: "s2", experience: "e2", projects: "p2" })
      .mockReturnValueOnce({ skills: "s3", experience: "e3", projects: "p3" });

    await resumeTailorService.generate(job);

    // Both grow attempts render (to find out whether they'd overflow),
    // but only the first is kept - the second overflowed and is
    // discarded, so it must never reach the ATS evaluation.
    expect(mockGrowOneStep).toHaveBeenCalledTimes(2);
    expect(mockRender).toHaveBeenCalledTimes(3);
    expect(mockEvaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        markdown: "# master resume+Skills:s2+Experience:e2+Projects:p2"
      })
    );
  });

  it("never grows past one page and passes the master's un-tailored sections to growOneStep", async () => {
    mockGrowOneStep.mockReturnValue(null);

    await resumeTailorService.generate(job);

    expect(mockGrowOneStep).toHaveBeenCalledWith(
      { skills: "skills!", experience: "experience!", projects: "projects!" },
      { skills: "Skills-original", experience: "Experience-original", projects: "Projects-original" }
    );
  });

  it("retries with feedback when claimable coverage fails, keeping the best attempt", async () => {
    const failing = { ...passingReport, score: 50, claimableCoverage: 50, missingKeywords: ["React"], passed: false };
    mockEvaluate.mockReturnValueOnce(failing).mockReturnValueOnce(passingReport);

    const result = await resumeTailorService.generate(job);

    expect(mockTailorSkills).toHaveBeenCalledTimes(2);
    const feedback = mockTailorSkills.mock.calls[1][2];
    expect(feedback).toContain("master resume contains every one of them");
    expect(result.ats).toEqual(passingReport);
  });

  it("saves the best attempt when all attempts fail", async () => {
    const worse = { ...passingReport, score: 40, claimableCoverage: 40, missingKeywords: ["React"], passed: false };
    const better = { ...passingReport, score: 60, claimableCoverage: 60, missingKeywords: [], passed: false, pages: 1 };
    mockEvaluate
      .mockReturnValueOnce(worse)
      .mockReturnValueOnce(better)
      .mockReturnValueOnce(worse);
    mockRender
      .mockResolvedValueOnce(Buffer.from("pdf-1"))
      .mockResolvedValueOnce(Buffer.from("pdf-2"))
      .mockResolvedValueOnce(Buffer.from("pdf-3"));

    const result = await resumeTailorService.generate(job);

    expect(mockSave).toHaveBeenCalledWith("Acme", "Software Engineer", Buffer.from("pdf-2"));
    expect(result.ats).toEqual(better);
  });
});
