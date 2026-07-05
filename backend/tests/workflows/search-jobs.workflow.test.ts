import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobStatus } from "../../src/models/job-status.model";

const { mockJobspediaSearch, mockGreenhouseSearch, mockBuild, mockSave, mockGetPipeline } = vi.hoisted(() => ({
  mockJobspediaSearch: vi.fn(),
  mockGreenhouseSearch: vi.fn(),
  mockBuild: vi.fn(),
  mockSave: vi.fn(),
  mockGetPipeline: vi.fn()
}));

vi.mock("../../src/services/jobs/providers/jobspedia/jobspedia.service", () => ({
  default: { search: mockJobspediaSearch }
}));
vi.mock("../../src/services/jobs/providers/greenhouse/greenhouse.service", () => ({
  default: { search: mockGreenhouseSearch }
}));
vi.mock("../../src/services/dashboard/dashboard.service", () => ({
  default: { build: mockBuild }
}));
vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { save: mockSave, getPipeline: mockGetPipeline }
}));

describe("SearchJobsWorkflow.run", () => {
  beforeEach(() => {
    mockJobspediaSearch.mockReset();
    mockGreenhouseSearch.mockReset();
    mockBuild.mockReset().mockReturnValue({ total: 0, resumesGenerated: 0, referralsReady: 0, applied: 0, jobs: [] });
    mockSave.mockReset();
    mockGetPipeline.mockReset().mockResolvedValue(null);
  });

  it("caches each found job as DISCOVERED without any scoring or Google API calls", async () => {
    const job = { id: "1" };
    mockJobspediaSearch.mockResolvedValue({ jobs: [job], total: 37 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({ title: "Engineer" });

    expect(mockSave).toHaveBeenCalledWith({ job, status: JobStatus.DISCOVERED });
  });

  it("preserves the existing status when a cached job re-surfaces in a new search", async () => {
    const job = { id: "1" };
    mockJobspediaSearch.mockResolvedValue({ jobs: [job], total: 1 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });
    mockGetPipeline.mockResolvedValue({ job, status: JobStatus.REFERRAL_READY });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({});

    expect(mockSave).toHaveBeenCalledWith({ job, status: JobStatus.REFERRAL_READY });
  });

  it("sums total across providers and passes page/limit/totalMatches to dashboardService.build", async () => {
    mockJobspediaSearch.mockResolvedValue({ jobs: [{ id: "1" }], total: 37 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({ title: "Engineer", page: 2, limit: 10 });

    expect(mockBuild).toHaveBeenCalledWith(
      [{ job: { id: "1" }, status: JobStatus.DISCOVERED }],
      { page: 2, limit: 10, totalMatches: 37 }
    );
  });

  it("defaults page to 1 and limit to 20 when not provided", async () => {
    mockJobspediaSearch.mockResolvedValue({ jobs: [], total: 0 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({});

    expect(mockBuild).toHaveBeenCalledWith(
      [],
      { page: 1, limit: 20, totalMatches: 0 }
    );
  });

  it("filters out jobs whose extracted years-of-experience falls outside minYears/maxYears", async () => {
    const junior = { id: "1", description: "Looking for 0-1 years of experience" };
    const midLevel = { id: "2", description: "3+ years of professional experience required" };
    const senior = { id: "3", description: "Minimum of 8 years of experience" };
    const unstated = { id: "4", description: "Join our growing team!" };
    mockJobspediaSearch.mockResolvedValue({
      jobs: [junior, midLevel, senior, unstated],
      total: 4
    });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({ minYears: 2, maxYears: 4 });

    expect(mockBuild).toHaveBeenCalledWith(
      [
        { job: midLevel, status: JobStatus.DISCOVERED },
        { job: unstated, status: JobStatus.DISCOVERED }
      ],
      { page: 1, limit: 20, totalMatches: 2 }
    );
  });

  it("falls back to a seniority estimate when the JD is a short teaser with no years mentioned", async () => {
    // Reproduces a real report: JPMC/Oracle Recruiting Cloud postings have
    // one-sentence teaser descriptions with no years mention at all, so a
    // "Lead"/"Principal" titled job was passing a 3-4 year search
    // untouched when only JD text was considered.
    const leadTeaser = {
      id: "1",
      seniority: "lead",
      description: "Carry out critical tech solutions across multiple technical areas as an integral part of an agile team"
    };
    const midTeaser = {
      id: "2",
      seniority: "mid",
      description: "Join our growing platform team and ship real features"
    };
    mockJobspediaSearch.mockResolvedValue({ jobs: [leadTeaser, midTeaser], total: 2 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({ minYears: 3, maxYears: 4 });

    expect(mockBuild).toHaveBeenCalledWith(
      [{ job: midTeaser, status: JobStatus.DISCOVERED }],
      { page: 1, limit: 20, totalMatches: 1 }
    );
  });

  it("does not filter by years when minYears/maxYears aren't provided", async () => {
    const job = { id: "1", description: "Minimum of 8 years of experience" };
    mockJobspediaSearch.mockResolvedValue({ jobs: [job], total: 1 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({});

    expect(mockBuild).toHaveBeenCalledWith(
      [{ job, status: JobStatus.DISCOVERED }],
      { page: 1, limit: 20, totalMatches: 1 }
    );
  });
});
