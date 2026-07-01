import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetMasterTemplate,
  mockGetMasterResume,
  mockSave,
  mockRender,
  mockTailorSkills,
  mockTailorExperience,
  mockTailorProjects
} = vi.hoisted(() => ({
  mockGetMasterTemplate: vi.fn(),
  mockGetMasterResume: vi.fn(),
  mockSave: vi.fn(),
  mockRender: vi.fn(),
  mockTailorSkills: vi.fn(),
  mockTailorExperience: vi.fn(),
  mockTailorProjects: vi.fn()
}));

vi.mock("../../../src/services/resume/resume.service", () => ({
  default: {
    getMasterTemplate: mockGetMasterTemplate,
    getMasterResume: mockGetMasterResume,
    save: mockSave
  }
}));

vi.mock("../../../src/services/resume/docx/docx.service", () => ({
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
    mockGetMasterTemplate.mockReset();
    mockGetMasterResume.mockReset();
    mockSave.mockReset();
    mockRender.mockReset();
    mockTailorSkills.mockReset();
    mockTailorExperience.mockReset();
    mockTailorProjects.mockReset();
  });

  it("tailors each master resume section, renders the docx, and saves it", async () => {
    const template = Buffer.from("template");
    const rendered = Buffer.from("rendered");

    mockGetMasterTemplate.mockResolvedValue(template);
    mockGetMasterResume.mockResolvedValue({
      skills: "a",
      experience: "b",
      projects: "c"
    });
    mockTailorSkills.mockResolvedValue("skills!");
    mockTailorExperience.mockResolvedValue("experience!");
    mockTailorProjects.mockResolvedValue("projects!");
    mockRender.mockReturnValue(rendered);
    mockSave.mockResolvedValue(
      "storage/resumes/generated/acme-software-engineer.docx"
    );

    const result = await resumeTailorService.generate(job);

    expect(mockTailorSkills).toHaveBeenCalledWith("a", "job description");
    expect(mockTailorExperience).toHaveBeenCalledWith("b", "job description");
    expect(mockTailorProjects).toHaveBeenCalledWith("c", "job description");
    expect(mockRender).toHaveBeenCalledWith(template, {
      SKILLS_SECTION: "skills!",
      EXPERIENCE_BULLETS: "experience!",
      PROJECTS_SECTION: "projects!"
    });
    expect(mockSave).toHaveBeenCalledWith(
      "Acme",
      "Software Engineer",
      rendered
    );
    expect(result).toEqual({
      docPath: "storage/resumes/generated/acme-software-engineer.docx"
    });
  });
});
