import { describe, it, expect, vi, afterEach } from "vitest";
import { dashboardService } from "./dashboardService";

describe("dashboardService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getDashboard() gets /api/dashboard", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: { total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0, jobs: [] } })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await dashboardService.getDashboard();

    expect(fetchMock).toHaveBeenCalledWith("/api/dashboard", expect.objectContaining({ headers: { "Content-Type": "application/json" } }));
    expect(result.total).toBe(1);
  });
});
