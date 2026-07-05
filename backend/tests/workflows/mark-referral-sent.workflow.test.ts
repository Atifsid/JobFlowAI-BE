import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobStatus } from "../../src/models/job-status.model";

const { mockGetPipeline, mockAdvanceStatus, mockMarkSent } = vi.hoisted(() => ({
  mockGetPipeline: vi.fn(),
  mockAdvanceStatus: vi.fn(),
  mockMarkSent: vi.fn()
}));

vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { getPipeline: mockGetPipeline, advanceStatus: mockAdvanceStatus }
}));
vi.mock("../../src/services/sheets/contacts.service", () => ({
  default: { markSent: mockMarkSent }
}));

const job = { id: "job-1", title: "Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test" };
const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

describe("MarkReferralSentWorkflow.run", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetPipeline.mockReset().mockResolvedValue({
      job,
      status: JobStatus.REFERRAL_READY,
      driveLink: "https://drive.example/resume"
    });
    mockAdvanceStatus.mockReset();
    mockMarkSent.mockReset();
  });

  it("throws when the job isn't cached", async () => {
    mockGetPipeline.mockResolvedValue(null);
    const { default: workflow } = await import("../../src/workflows/mark-referral-sent.workflow");

    await expect(workflow.run({ jobId: "missing", employee })).rejects.toThrow("Job not found");
  });

  it("records the contact on the Contacts tab and advances the status to REFERRAL_SENT", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { GOOGLE_SHEET_ID: "sheet-123" } }));
    const { default: workflow } = await import("../../src/workflows/mark-referral-sent.workflow");

    const result = await workflow.run({ jobId: "job-1", employee });

    expect(mockMarkSent).toHaveBeenCalledWith(job, employee, "https://drive.example/resume");
    expect(mockAdvanceStatus).toHaveBeenCalledWith("job-1", JobStatus.REFERRAL_SENT);
    expect(result).toEqual({ tracked: true });
  });

  it("still advances the status when Sheets isn't configured, but skips the write", async () => {
    vi.doMock("../../src/config/env", () => ({ env: { GOOGLE_SHEET_ID: "" } }));
    const { default: workflow } = await import("../../src/workflows/mark-referral-sent.workflow");

    const result = await workflow.run({ jobId: "job-1", employee });

    expect(mockMarkSent).not.toHaveBeenCalled();
    expect(mockAdvanceStatus).toHaveBeenCalledWith("job-1", JobStatus.REFERRAL_SENT);
    expect(result).toEqual({ tracked: false });
  });
});
