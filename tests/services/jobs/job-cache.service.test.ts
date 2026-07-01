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
  score: { score: 80, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
  decision: "DIRECT_APPLY",
  actions: [],
  status: JobStatus.ANALYZED
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

  it("getAll() filters out old-format entries missing job/score, keeping well-formed pipelines", async () => {
    const malformed = { id: "job-2", title: "Old Format Job" };
    mockReadAll.mockResolvedValue([pipeline, malformed]);

    const result = await jobCacheService.getAll();

    expect(result).toEqual([pipeline]);
  });
});
