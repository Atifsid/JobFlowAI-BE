import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobStatus } from "../../src/models/job-status.model";

const { mockGet, mockAdvanceStatus, mockFind, mockGenerate } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockAdvanceStatus: vi.fn(),
  mockFind: vi.fn(),
  mockGenerate: vi.fn()
}));

vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { get: mockGet, advanceStatus: mockAdvanceStatus }
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

describe("GenerateReferralWorkflow.run", () => {
  beforeEach(() => {
    mockGet.mockReset().mockResolvedValue(job);
    mockAdvanceStatus.mockReset();
    mockFind.mockReset().mockResolvedValue([employee]);
    mockGenerate.mockReset().mockResolvedValue("Hey Sarah - quick note");
  });

  it("throws when the job isn't cached", async () => {
    mockGet.mockResolvedValue(null);
    await expect(workflow.run("missing")).rejects.toThrow("Job not found");
  });

  it("drafts a message per employee found at the job's company", async () => {
    const result = await workflow.run("job-1");

    expect(mockFind).toHaveBeenCalledWith("Acme");
    expect(result).toEqual([{ employee, message: "Hey Sarah - quick note" }]);
  });

  it("advances the job's status to REFERRAL_READY after drafting", async () => {
    await workflow.run("job-1");

    expect(mockAdvanceStatus).toHaveBeenCalledWith("job-1", JobStatus.REFERRAL_READY);
  });
});
