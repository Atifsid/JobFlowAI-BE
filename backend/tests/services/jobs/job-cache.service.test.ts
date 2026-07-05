import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockWrite, mockRead, mockReadAll, mockExists } = vi.hoisted(() => ({
  mockWrite: vi.fn(),
  mockRead: vi.fn(),
  mockReadAll: vi.fn(),
  mockExists: vi.fn()
}));

vi.mock("../../../src/services/storage/storage.service", () => ({
  default: { write: mockWrite, read: mockRead, readAll: mockReadAll, exists: mockExists }
}));

import jobCacheService from "../../../src/services/jobs/job-cache.service";
import { JobPipeline } from "../../../src/models/job-pipeline.model";
import { JobStatus } from "../../../src/models/job-status.model";

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

describe("JobCacheService", () => {
  beforeEach(() => {
    mockWrite.mockReset();
    mockRead.mockReset();
    mockReadAll.mockReset();
    mockExists.mockReset();
  });

  it("save() writes the full pipeline keyed by job id", async () => {
    await jobCacheService.save(pipeline);

    expect(mockWrite).toHaveBeenCalledWith("jobs", "job-1.json", pipeline);
  });

  it("get() returns just the Job from the stored pipeline", async () => {
    mockRead.mockResolvedValue(pipeline);

    const result = await jobCacheService.get("job-1");

    expect(mockRead).toHaveBeenCalledWith("jobs", "job-1.json");
    expect(result).toEqual(pipeline.job);
  });

  it("get() returns null when nothing is cached", async () => {
    mockRead.mockResolvedValue(null);

    const result = await jobCacheService.get("missing");

    expect(result).toBeNull();
  });

  it("getAll() returns every cached pipeline", async () => {
    mockReadAll.mockResolvedValue([pipeline]);

    const result = await jobCacheService.getAll();

    expect(mockReadAll).toHaveBeenCalledWith("jobs");
    expect(result).toEqual([pipeline]);
  });

  it("getAll() filters out malformed entries missing a job", async () => {
    const malformed = { id: "job-2", title: "Old Format Job" };
    mockReadAll.mockResolvedValue([pipeline, malformed]);

    const result = await jobCacheService.getAll();

    expect(result).toEqual([pipeline]);
  });

  it("normalizes legacy entries: strips score/decision/actions and maps the retired ANALYZED status to DISCOVERED", async () => {
    const legacy = {
      job: pipeline.job,
      score: { score: 80 },
      decision: "DIRECT_APPLY",
      actions: ["GENERATE_RESUME"],
      status: "ANALYZED"
    };
    mockRead.mockResolvedValue(legacy);

    const result = await jobCacheService.getPipeline("job-1");

    expect(result).toEqual({ job: pipeline.job, status: JobStatus.DISCOVERED });
  });

  it("keeps a legacy entry's valid status while stripping the dead fields", async () => {
    const legacy = { job: pipeline.job, decision: "REFERRAL", status: "REFERRAL_READY" };
    mockRead.mockResolvedValue(legacy);

    const result = await jobCacheService.getPipeline("job-1");

    expect(result).toEqual({ job: pipeline.job, status: JobStatus.REFERRAL_READY });
  });

  it("getPipeline() returns null when nothing is cached", async () => {
    mockRead.mockResolvedValue(null);

    const result = await jobCacheService.getPipeline("missing");

    expect(result).toBeNull();
  });

  describe("advanceStatus()", () => {
    it("moves the status forward", async () => {
      mockRead.mockResolvedValue({ ...pipeline, status: JobStatus.DISCOVERED });

      await jobCacheService.advanceStatus("job-1", JobStatus.RESUME_GENERATED);

      expect(mockWrite).toHaveBeenCalledWith("jobs", "job-1.json", {
        job: pipeline.job,
        status: JobStatus.RESUME_GENERATED
      });
    });

    it("never moves the status backward", async () => {
      mockRead.mockResolvedValue({ ...pipeline, status: JobStatus.REFERRAL_SENT });

      await jobCacheService.advanceStatus("job-1", JobStatus.RESUME_GENERATED);

      expect(mockWrite).not.toHaveBeenCalled();
    });

    it("revives a SKIPPED job when the pipeline is explicitly re-run on it", async () => {
      mockRead.mockResolvedValue({ ...pipeline, status: JobStatus.SKIPPED });

      await jobCacheService.advanceStatus("job-1", JobStatus.RESUME_GENERATED);

      expect(mockWrite).toHaveBeenCalledWith("jobs", "job-1.json", {
        job: pipeline.job,
        status: JobStatus.RESUME_GENERATED
      });
    });

    it("does nothing when the job isn't cached", async () => {
      mockRead.mockResolvedValue(null);

      await jobCacheService.advanceStatus("missing", JobStatus.RESUME_GENERATED);

      expect(mockWrite).not.toHaveBeenCalled();
    });
  });
});
