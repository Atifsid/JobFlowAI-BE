import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobStatus } from "../../src/models/job-status.model";

const { mockGet, mockGetPipeline, mockCacheSave, mockAdvanceStatus, mockGenerate, mockUpload, mockUpsert } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockGetPipeline: vi.fn(),
  mockCacheSave: vi.fn(),
  mockAdvanceStatus: vi.fn(),
  mockGenerate: vi.fn(),
  mockUpload: vi.fn(),
  mockUpsert: vi.fn()
}));

vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { get: mockGet, getPipeline: mockGetPipeline, save: mockCacheSave, advanceStatus: mockAdvanceStatus }
}));
vi.mock("../../src/services/resume/resume-tailor.service", () => ({
  default: { generate: mockGenerate }
}));
vi.mock("../../src/services/drive/drive.service", () => ({
  default: { upload: mockUpload }
}));
vi.mock("../../src/services/sheets/sheets.service", () => ({
  default: { upsert: mockUpsert }
}));

const job = { id: "job-1", title: "Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test" };
const pipeline = { job, status: JobStatus.DISCOVERED };
const ats = { score: 90, matchedKeywords: ["React"], missingKeywords: [], pages: 1, missingEmployers: [], passed: true };

describe("ResumeWorkflow.run", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGet.mockReset().mockResolvedValue(job);
    mockGetPipeline.mockReset().mockResolvedValue(pipeline);
    mockCacheSave.mockReset();
    mockAdvanceStatus.mockReset();
    mockGenerate.mockReset().mockResolvedValue({ pdfPath: "storage/resumes/generated/a.pdf", keywords: ["React", "AWS"], ats });
    mockUpload.mockReset().mockResolvedValue("https://drive.example/a");
    mockUpsert.mockReset();
  });

  it("throws when the job isn't cached", async () => {
    mockGet.mockResolvedValue(null);
    const { default: workflow } = await import("../../src/workflows/resume.workflow");
    await expect(workflow.run("missing")).rejects.toThrow("Job not found.");
  });

  it("persists the extracted keywords and ATS report on the cached pipeline, then advances its status", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: false, GOOGLE_SHEET_ID: "" } }));
    const { default: workflow } = await import("../../src/workflows/resume.workflow");

    await workflow.run("job-1");

    expect(mockCacheSave).toHaveBeenCalledWith({ ...pipeline, keywords: ["React", "AWS"], ats });
    expect(mockAdvanceStatus).toHaveBeenCalledWith("job-1", JobStatus.RESUME_GENERATED);
  });

  it("writes a Sheets row for the job when GOOGLE_SHEET_ID is configured", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: false, GOOGLE_SHEET_ID: "sheet-123" } }));
    const { default: workflow } = await import("../../src/workflows/resume.workflow");

    await workflow.run("job-1");

    expect(mockGetPipeline).toHaveBeenCalledWith("job-1");
    expect(mockUpsert).toHaveBeenCalledWith("job-1", expect.arrayContaining(["job-1", "Acme", "Engineer"]));
  });

  it("skips Sheets entirely when GOOGLE_SHEET_ID is not configured", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: false, GOOGLE_SHEET_ID: "" } }));
    const { default: workflow } = await import("../../src/workflows/resume.workflow");

    await workflow.run("job-1");

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("skips Drive upload when DRIVE_UPLOAD_ENABLED is false, still returns the pdfPath", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { DRIVE_UPLOAD_ENABLED: false, GOOGLE_SHEET_ID: "" } }));
    const { default: workflow } = await import("../../src/workflows/resume.workflow");

    const result = await workflow.run("job-1");

    expect(mockUpload).not.toHaveBeenCalled();
    expect(result).toEqual({ pdfPath: "storage/resumes/generated/a.pdf", driveLink: undefined, ats });
    expect(mockCacheSave).toHaveBeenCalledWith({ ...pipeline, keywords: ["React", "AWS"], ats });
  });
});
