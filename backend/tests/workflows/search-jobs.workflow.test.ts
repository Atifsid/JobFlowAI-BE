import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockJobspediaSearch, mockGreenhouseSearch, mockExists, mockRunMany, mockBuild, mockSave, mockUpsert } = vi.hoisted(() => ({
  mockJobspediaSearch: vi.fn(),
  mockGreenhouseSearch: vi.fn(),
  mockExists: vi.fn(),
  mockRunMany: vi.fn(),
  mockBuild: vi.fn(),
  mockSave: vi.fn(),
  mockUpsert: vi.fn()
}));

vi.mock("../../src/services/jobs/providers/jobspedia/jobspedia.service", () => ({
  default: { search: mockJobspediaSearch }
}));
vi.mock("../../src/services/jobs/providers/greenhouse/greenhouse.service", () => ({
  default: { search: mockGreenhouseSearch }
}));
vi.mock("../../src/services/jobs/job-pipeline.service", () => ({
  default: { runMany: mockRunMany }
}));
vi.mock("../../src/services/dashboard/dashboard.service", () => ({
  default: { build: mockBuild }
}));
vi.mock("../../src/services/sheets/sheets.service", () => ({
  default: { exists: mockExists, upsert: mockUpsert }
}));
vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { save: mockSave }
}));

describe("SearchJobsWorkflow.run", () => {
  beforeEach(() => {
    mockJobspediaSearch.mockReset();
    mockGreenhouseSearch.mockReset();
    mockExists.mockReset().mockResolvedValue(false);
    mockRunMany.mockReset().mockResolvedValue([]);
    mockBuild.mockReset().mockReturnValue({ total: 0, referral: 0, directApply: 0, skip: 0, jobs: [] });
    mockSave.mockReset();
    mockUpsert.mockReset();
  });

  it("sums total across providers and passes page/limit/totalMatches to dashboardService.build", async () => {
    mockJobspediaSearch.mockResolvedValue({ jobs: [{ id: "1" }], total: 37 });
    mockGreenhouseSearch.mockResolvedValue({ jobs: [], total: 0 });

    const { default: workflow } = await import("../../src/workflows/search-jobs.workflow");
    await workflow.run({ title: "Engineer", page: 2, limit: 10 });

    expect(mockBuild).toHaveBeenCalledWith(
      [],
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
});
