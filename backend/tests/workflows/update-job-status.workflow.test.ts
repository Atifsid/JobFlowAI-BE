import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetPipeline, mockSave, mockUpsert } = vi.hoisted(() => ({
  mockGetPipeline: vi.fn(),
  mockSave: vi.fn(),
  mockUpsert: vi.fn()
}));

vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { getPipeline: mockGetPipeline, save: mockSave }
}));

vi.mock("../../src/services/sheets/sheets.service", () => ({
  default: { upsert: mockUpsert }
}));

import workflow from "../../src/workflows/update-job-status.workflow";
import { JobPipeline } from "../../src/models/job-pipeline.model";
import { JobStatus } from "../../src/models/job-status.model";

const pipeline: JobPipeline = {
  job: {
    id: "job-1",
    title: "Engineer",
    company: "Acme",
    location: "Remote",
    remote: true,
    description: "",
    skills: [],
    applyUrl: "https://example.com",
    source: "test"
  },
  status: JobStatus.DISCOVERED
};

describe("UpdateJobStatusWorkflow", () => {
  beforeEach(() => {
    mockGetPipeline.mockReset();
    mockSave.mockReset();
    mockUpsert.mockReset();
  });

  it("updates the cached pipeline's status and syncs it to Sheets", async () => {
    mockGetPipeline.mockResolvedValue(pipeline);

    const result = await workflow.run({ jobId: "job-1", status: JobStatus.APPLIED });

    expect(result.status).toBe(JobStatus.APPLIED);
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ status: JobStatus.APPLIED }));
    expect(mockUpsert).toHaveBeenCalledWith("job-1", expect.any(Array));
  });

  it("throws when no cached pipeline exists for the job id", async () => {
    mockGetPipeline.mockResolvedValue(null);

    await expect(workflow.run({ jobId: "missing", status: JobStatus.APPLIED }))
      .rejects.toThrow("No cached job found for id missing");
  });
});
