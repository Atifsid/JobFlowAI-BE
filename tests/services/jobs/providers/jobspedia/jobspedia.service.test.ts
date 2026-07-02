import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobSearch } from "../../../../../src/models/job-search.model";

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock("axios", () => ({
  default: {
    create: () => ({ post: mockPost })
  }
}));

const search: JobSearch = {
  title: "Software Engineer",
  keywords: ["python"],
  remote: true,
  experience: ["Senior", "Staff"],
  page: 2,
  limit: 10
};

describe("JobspediaService.search", () => {
  beforeEach(() => {
    vi.resetModules();
    mockPost.mockReset();
  });

  it("posts the mapped search request and only sends the first experience entry", async () => {
    mockPost.mockResolvedValue({
      data: {
        jobs: [
          {
            id: "abc123",
            title: "Senior Software Engineer",
            company: "Acme",
            location: "Berlin, Germany",
            city: "Berlin",
            region: null,
            country: "DE",
            isRemote: true,
            salaryMin: 90000,
            salaryMax: 120000,
            currency: "EUR",
            applyUrl: "https://boards.greenhouse.io/acme/jobs/1",
            description: "Build things.",
            datePosted: "2026-06-01",
            platform: "greenhouse",
            source: "ats"
          }
        ],
        page: 2,
        count: 1
      }
    });

    const { default: jobspediaService } = await import(
      "../../../../../src/services/jobs/providers/jobspedia/jobspedia.service"
    );

    const result = await jobspediaService.search(search);

    expect(mockPost).toHaveBeenCalledWith(
      "/jobs/search",
      expect.objectContaining({
        title: "Software Engineer",
        keywords: ["python"],
        remote: true,
        experience: "Senior",
        page: 2,
        limit: 10
      })
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: "abc123",
        title: "Senior Software Engineer",
        company: "Acme",
        remote: true,
        salaryMin: 90000,
        salaryMax: 120000,
        applyUrl: "https://boards.greenhouse.io/acme/jobs/1",
        source: "Jobspedia"
      })
    ]);
  });
});
