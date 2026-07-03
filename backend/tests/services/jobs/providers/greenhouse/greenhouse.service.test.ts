import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JobSearch } from "../../../../../src/models/job-search.model";

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));

vi.mock("axios", () => ({
  default: { get: mockGet }
}));

const buildGreenhouseJob = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  title: "Software Engineer",
  company_name: "Acme",
  absolute_url: "https://acme.com/jobs/1",
  location: { name: "Remote" },
  content: "<p>Great job</p>",
  first_published: "2026-01-01T00:00:00Z",
  ...overrides
});

describe("GreenhouseProvider.search", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGet.mockReset();
  });

  afterEach(() => {
    delete process.env.GREENHOUSE_BOARD_TOKENS;
  });

  it("returns an empty array without calling axios when no boards are configured", async () => {
    process.env.GREENHOUSE_BOARD_TOKENS = "";
    const { default: greenhouseProvider } = await import(
      "../../../../../src/services/jobs/providers/greenhouse/greenhouse.service"
    );

    const result = await greenhouseProvider.search({ title: "Engineer" });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("fetches every configured board and maps jobs matching the title", async () => {
    process.env.GREENHOUSE_BOARD_TOKENS = "acme, other-co";
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/acme/")) {
        return Promise.resolve({
          data: { jobs: [buildGreenhouseJob()] }
        });
      }
      return Promise.resolve({
        data: {
          jobs: [buildGreenhouseJob({ id: 2, title: "Sales Rep" })]
        }
      });
    });

    const { default: greenhouseProvider } = await import(
      "../../../../../src/services/jobs/providers/greenhouse/greenhouse.service"
    );

    const result = await greenhouseProvider.search({ title: "Engineer" });

    expect(mockGet).toHaveBeenCalledWith(
      "https://boards-api.greenhouse.io/v1/boards/acme/jobs",
      { params: { content: true } }
    );
    expect(mockGet).toHaveBeenCalledWith(
      "https://boards-api.greenhouse.io/v1/boards/other-co/jobs",
      { params: { content: true } }
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: "greenhouse-1",
        title: "Software Engineer",
        company: "Acme",
        remote: true,
        source: "Greenhouse"
      })
    ]);
  });

  it("excludes non-remote jobs when the search requires remote", async () => {
    process.env.GREENHOUSE_BOARD_TOKENS = "acme";
    mockGet.mockResolvedValue({
      data: {
        jobs: [
          buildGreenhouseJob({ location: { name: "San Francisco, CA" } })
        ]
      }
    });

    const { default: greenhouseProvider } = await import(
      "../../../../../src/services/jobs/providers/greenhouse/greenhouse.service"
    );

    const search: JobSearch = { title: "Engineer", remote: true };
    const result = await greenhouseProvider.search(search);

    expect(result).toEqual([]);
  });
});
