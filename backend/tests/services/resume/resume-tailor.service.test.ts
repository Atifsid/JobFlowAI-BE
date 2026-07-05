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
  default: { evaluate: mockEvaluate }
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
  matchedKeywords: ["React", "AWS"],
  missingKeywords: [],
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
    mockExtractKeywords.mockReset().mockResolvedValue(["React", "AWS"]);
    mockEvaluate.mockReset().mockReturnValue(passingReport);
    mockWarn.mockReset();
  });

  it("extracts keywords, tailors each section with them, renders, gates, and saves", async () => {
    const result = await resumeTailorService.generate(job);

    expect(mockExtractKeywords).toHaveBeenCalledWith("job description");
    expect(mockTailorSkills).toHaveBeenCalledWith("Skills-original", ["React", "AWS"], undefined);
    expect(mockTailorExperience).toHaveBeenCalledWith("Experience-original", ["React", "AWS"], undefined);
    expect(mockTailorProjects).toHaveBeenCalledWith("Projects-original", ["React", "AWS"], undefined);
    expect(mockRender).toHaveBeenCalledWith(
      "# master resume+Skills:skills!+Experience:experience!+Projects:projects!"
    );
    expect(mockEvaluate).toHaveBeenCalledWith({
      markdown: "# master resume+Skills:skills!+Experience:experience!+Projects:projects!",
      pdf: Buffer.from("pdf-bytes"),
      keywords: ["React", "AWS"],
      masterExperience: "Experience-original",
      tailoredExperience: "experience!"
    });
    expect(mockSave).toHaveBeenCalledWith("Acme", "Software Engineer", Buffer.from("pdf-bytes"));
    expect(result).toEqual({
      pdfPath: "storage/resumes/generated/acme-software-engineer.pdf",
      keywords: ["React", "AWS"],
      ats: passingReport
    });
    // Gate passed first try - no retry.
    expect(mockTailorSkills).toHaveBeenCalledTimes(1);
  });

  it("retries once with concrete feedback when the ATS gate fails", async () => {
    const failingReport = {
      score: 50,
      matchedKeywords: ["React"],
      missingKeywords: ["AWS"],
      pages: 2,
      missingEmployers: ["Beta Inc"],
      passed: false
    };
    mockEvaluate.mockReturnValueOnce(failingReport).mockReturnValueOnce(passingReport);

    const result = await resumeTailorService.generate(job);

    expect(mockTailorSkills).toHaveBeenCalledTimes(2);
    const feedback = mockTailorSkills.mock.calls[1][2];
    expect(feedback).toContain("AWS");
    expect(feedback).toContain("2 pages");
    expect(feedback).toContain("Beta Inc");
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining("ATS gate failed"));
    expect(result.ats).toEqual(passingReport);
  });

  it("saves the resume anyway after all retries still fail, with the failing report attached", async () => {
    const failingReport = { ...passingReport, score: 40, missingKeywords: ["AWS"], passed: false };
    mockEvaluate.mockReturnValue(failingReport);

    const result = await resumeTailorService.generate(job);

    expect(mockTailorSkills).toHaveBeenCalledTimes(3);
    expect(mockSave).toHaveBeenCalled();
    expect(result.ats).toEqual(failingReport);
  });

  it("always restates the standing one-page/budget constraints in retry feedback", async () => {
    const keywordOnlyFailure = { ...passingReport, score: 60, missingKeywords: ["AWS"], passed: false };
    mockEvaluate.mockReturnValueOnce(keywordOnlyFailure).mockReturnValueOnce(passingReport);

    await resumeTailorService.generate(job);

    const feedback = mockTailorSkills.mock.calls[1][2];
    expect(feedback).toContain("one-page total");
  });

  it("keeps the best attempt when all fail: a one-page draft beats two-page ones with higher coverage", async () => {
    const onePageLowCoverage = { ...passingReport, score: 63, missingKeywords: ["AWS"], pages: 1, passed: false };
    const twoPageHighCoverage = { ...passingReport, score: 94, missingKeywords: [], pages: 2, passed: false };
    mockEvaluate
      .mockReturnValueOnce(onePageLowCoverage)
      .mockReturnValueOnce(twoPageHighCoverage)
      .mockReturnValueOnce(twoPageHighCoverage);
    mockRender
      .mockResolvedValueOnce(Buffer.from("attempt-1-pdf"))
      .mockResolvedValueOnce(Buffer.from("attempt-2-pdf"))
      .mockResolvedValueOnce(Buffer.from("attempt-3-pdf"));

    const result = await resumeTailorService.generate(job);

    expect(mockSave).toHaveBeenCalledWith("Acme", "Software Engineer", Buffer.from("attempt-1-pdf"));
    expect(result.ats).toEqual(onePageLowCoverage);
  });
});
