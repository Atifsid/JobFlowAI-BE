import { describe, it, expect, vi, afterEach } from "vitest";
import { jobService } from "./jobService";

describe("jobService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("search() posts to /api/jobs/search with the given params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: { total: 0, resumesGenerated: 0, referralsReady: 0, applied: 0, jobs: [] } })
    });
    vi.stubGlobal("fetch", fetchMock);

    await jobService.search({ title: "Engineer", remote: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/search",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "Engineer", remote: true }) })
    );
  });

  it("updateStatus() patches /api/jobs/:jobId/status with the new status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: { status: "APPLIED" } })
    });
    vi.stubGlobal("fetch", fetchMock);

    await jobService.updateStatus("job-1", "APPLIED");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/jobs/job-1/status",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ status: "APPLIED" }) })
    );
  });
});
