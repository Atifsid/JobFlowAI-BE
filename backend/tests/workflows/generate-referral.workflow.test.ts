import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobStatus } from "../../src/models/job-status.model";

const { mockGetPipeline, mockAdvanceStatus, mockFind, mockGenerate } = vi.hoisted(() => ({
  mockGetPipeline: vi.fn(),
  mockAdvanceStatus: vi.fn(),
  mockFind: vi.fn(),
  mockGenerate: vi.fn()
}));

vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { getPipeline: mockGetPipeline, advanceStatus: mockAdvanceStatus }
}));
vi.mock("../../src/services/employees/employee.service", () => ({
  default: { find: mockFind }
}));
vi.mock("../../src/services/referrals/referral.service", () => ({
  default: { generate: mockGenerate }
}));

import workflow from "../../src/workflows/generate-referral.workflow";

const job = { id: "job-1", title: "Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test" };
const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };
const pipeline = { job, status: JobStatus.RESUME_GENERATED, driveLink: "https://drive.example/resume" };

describe("GenerateReferralWorkflow.run", () => {
  beforeEach(() => {
    mockGetPipeline.mockReset().mockResolvedValue(pipeline);
    mockAdvanceStatus.mockReset();
    mockFind.mockReset().mockResolvedValue([employee]);
    mockGenerate.mockReset().mockResolvedValue("Hey Sarah - quick note");
  });

  it("throws when the job isn't cached", async () => {
    mockGetPipeline.mockResolvedValue(null);
    await expect(workflow.run("missing")).rejects.toThrow("Job not found");
  });

  it("drafts a message per employee, passing the pipeline's Drive link", async () => {
    const result = await workflow.run("job-1");

    expect(mockFind).toHaveBeenCalledWith("Acme");
    expect(mockGenerate).toHaveBeenCalledWith(job, employee, "https://drive.example/resume");
    expect(result).toEqual([{ employee, message: "Hey Sarah - quick note" }]);
  });

  it("passes no resume link when the pipeline has none", async () => {
    mockGetPipeline.mockResolvedValue({ job, status: JobStatus.DISCOVERED });

    await workflow.run("job-1");

    expect(mockGenerate).toHaveBeenCalledWith(job, employee, undefined);
  });

  it("advances the job's status to REFERRAL_READY after drafting", async () => {
    await workflow.run("job-1");

    expect(mockAdvanceStatus).toHaveBeenCalledWith("job-1", JobStatus.REFERRAL_READY);
  });
});
