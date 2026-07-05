import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTracker } from "./useTracker";
import { dashboardService } from "../services/dashboardService";
import { jobService } from "../services/jobService";

vi.mock("../services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn() }
}));
vi.mock("../services/jobService", () => ({
  jobService: { updateStatus: vi.fn() }
}));

describe("useTracker", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockReset();
    vi.mocked(jobService.updateStatus).mockReset();
  });

  it("loads the dashboard and applies a status update to the matching job", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0,
      jobs: [{ job: { id: "job-1" }, status: "DISCOVERED" } as never]
    });
    vi.mocked(jobService.updateStatus).mockResolvedValue({ job: { id: "job-1" }, status: "APPLIED" } as never);

    const { result } = renderHook(() => useTracker());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateStatus("job-1", "APPLIED" as never);
    });

    expect(result.current.dashboard?.jobs[0].status).toBe("APPLIED");
  });
});
