import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerate, mockUpload } = vi.hoisted(() => ({
  mockGenerate: vi.fn(),
  mockUpload: vi.fn()
}));

vi.mock("../../src/services/resume/resume-tailor.service", () => ({
  default: { generate: mockGenerate }
}));
vi.mock("../../src/services/drive/drive.service", () => ({
  default: { upload: mockUpload }
}));

const ats = { score: 90, matchedKeywords: ["React"], missingKeywords: [], pages: 1, missingEmployers: [], passed: true };
const description = "A".repeat(60);

describe("GenerateResumeAdhocWorkflow.run", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGenerate.mockReset().mockResolvedValue({ pdfPath: "storage/resumes/generated/a.pdf", keywords: ["React"], ats });
    mockUpload.mockReset().mockResolvedValue("https://drive.example/a");
  });

  it("builds a synthetic Job from the input and tailors a resume from it, skipping Drive when disabled", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: false } }));
    const { default: workflow } = await import("../../src/workflows/generate-resume-adhoc.workflow");

    const result = await workflow.run({ title: "Engineer", company: "Acme", description });

    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Engineer",
        company: "Acme",
        description,
        location: "Not specified",
        remote: false,
        skills: [],
        applyUrl: "",
        source: "manual"
      })
    );
    expect(mockUpload).not.toHaveBeenCalled();
    expect(result).toEqual({ pdfPath: "storage/resumes/generated/a.pdf", driveLink: undefined, ats, keywords: ["React"] });
  });

  it("uploads to Drive when DRIVE_UPLOAD_ENABLED is true", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: true } }));
    const { default: workflow } = await import("../../src/workflows/generate-resume-adhoc.workflow");

    const result = await workflow.run({ title: "Engineer", company: "Acme", description });

    expect(mockUpload).toHaveBeenCalledWith("storage/resumes/generated/a.pdf", "a.pdf");
    expect(result.driveLink).toBe("https://drive.example/a");
  });

  it("generates a fresh id for each call", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: false } }));
    const { default: workflow } = await import("../../src/workflows/generate-resume-adhoc.workflow");

    await workflow.run({ title: "Engineer", company: "Acme", description });
    const firstId = mockGenerate.mock.calls[0][0].id;
    await workflow.run({ title: "Engineer", company: "Acme", description });
    const secondId = mockGenerate.mock.calls[1][0].id;

    expect(firstId).not.toEqual(secondId);
  });
});
