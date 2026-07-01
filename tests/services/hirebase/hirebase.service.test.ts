import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JobSearch } from "../../../src/models/job-search.model";

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock("axios", () => ({
  default: {
    create: () => ({ post: mockPost })
  }
}));

const search: JobSearch = { title: "Software Engineer" };

describe("HireBaseService.searchJobs", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPost.mockReset();
  });

  afterEach(() => {
    delete process.env.HIREBASE_USE_LIVE_API;
  });

  it("returns the stub response and never calls axios when the flag is off", async () => {
    process.env.HIREBASE_USE_LIVE_API = "false";
    const { default: hirebaseService } = await import(
      "../../../src/services/hirebase/hirebase.service"
    );

    const result = await hirebaseService.searchJobs(search);

    expect(mockPost).not.toHaveBeenCalled();
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs[0]).toHaveProperty("source", "HireBase");
  });

  it("calls the real HireBase API and maps the response when the flag is on", async () => {
    process.env.HIREBASE_USE_LIVE_API = "true";
    mockPost.mockResolvedValue({
      data: {
        jobs: [
          {
            _id: "1",
            job_title: "Engineer",
            company_name: "Acme",
            location_raw: "Remote",
            application_link: "https://example.com/apply"
          }
        ],
        total_count: 1
      }
    });

    const { default: hirebaseService } = await import(
      "../../../src/services/hirebase/hirebase.service"
    );

    const result = await hirebaseService.searchJobs(search);

    expect(mockPost).toHaveBeenCalledWith(
      "/jobs/search",
      expect.objectContaining({ job_titles: ["Software Engineer"] })
    );
    expect(result.jobs).toEqual([
      expect.objectContaining({
        id: "1",
        title: "Engineer",
        company: "Acme",
        source: "HireBase"
      })
    ]);
  });
});
