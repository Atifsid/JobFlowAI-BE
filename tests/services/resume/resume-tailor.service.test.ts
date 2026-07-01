import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetMasterResume,
  mockSave,
  mockExtract,
  mockReplace,
  mockRender,
  mockTailorSkills,
  mockTailorExperience,
  mockTailorProjects
} = vi.hoisted(() => ({
  mockGetMasterResume: vi.fn(),
  mockSave: vi.fn(),
  mockExtract: vi.fn(),
  mockReplace: vi.fn(),
  mockRender: vi.fn(),
  mockTailorSkills: vi.fn(),
  mockTailorExperience: vi.fn(),
  mockTailorProjects: vi.fn()
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
    tailorSkills: mockTailorSkills,
    tailorExperience: mockTailorExperience,
    tailorProjects: mockTailorProjects
  }
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

describe("ResumeTailorService.generate", () => {
  beforeEach(() => {
    mockGetMasterResume.mockReset();
    mockSave.mockReset();
    mockExtract.mockReset();
    mockReplace.mockReset();
    mockRender.mockReset();
    mockTailorSkills.mockReset();
    mockTailorExperience.mockReset();
    mockTailorProjects.mockReset();
  });

  it("extracts and tailors each section, renders the pdf, and saves it", async () => {
    const master = "# master resume";
    const pdf = Buffer.from("pdf-bytes");

    mockGetMasterResume.mockResolvedValue(master);
    mockExtract.mockImplementation((_md: string, section: string) => `${section}-original`);
    mockTailorSkills.mockResolvedValue("skills!");
    mockTailorExperience.mockResolvedValue("experience!");
    mockTailorProjects.mockResolvedValue("projects!");
    mockReplace.mockImplementation(
      (md: string, section: string, content: string) => `${md}+${section}:${content}`
    );
    mockRender.mockResolvedValue(pdf);
    mockSave.mockResolvedValue("storage/resumes/generated/acme-software-engineer.pdf");

    const result = await resumeTailorService.generate(job);

    expect(mockExtract).toHaveBeenCalledWith(master, "Skills");
    expect(mockExtract).toHaveBeenCalledWith(master, "Experience");
    expect(mockExtract).toHaveBeenCalledWith(master, "Projects");
    expect(mockTailorSkills).toHaveBeenCalledWith("Skills-original", "job description");
    expect(mockTailorExperience).toHaveBeenCalledWith(
      "Experience-original",
      "job description"
    );
    expect(mockTailorProjects).toHaveBeenCalledWith(
      "Projects-original",
      "job description"
    );
    expect(mockReplace).toHaveBeenCalledWith(master, "Skills", "skills!");
    expect(mockRender).toHaveBeenCalledWith(
      `${master}+Skills:skills!+Experience:experience!+Projects:projects!`
    );
    expect(mockSave).toHaveBeenCalledWith("Acme", "Software Engineer", pdf);
    expect(result).toEqual({
      pdfPath: "storage/resumes/generated/acme-software-engineer.pdf"
    });
  });
});
