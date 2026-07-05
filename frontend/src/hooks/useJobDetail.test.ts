import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useJobDetail } from "./useJobDetail";
import { dashboardService } from "../services/dashboardService";
import { jobService } from "../services/jobService";

vi.mock("../services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn() }
}));
vi.mock("../services/jobService", () => ({
  jobService: { updateStatus: vi.fn() }
}));

describe("useJobDetail", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockReset();
    vi.mocked(jobService.updateStatus).mockReset();
  });

  it("finds the matching pipeline from the dashboard by job id", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0,
      jobs: [{ job: { id: "job-1" }, status: "DISCOVERED" } as never]
    });

    const { result } = renderHook(() => useJobDetail("job-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pipeline?.job.id).toBe("job-1");
    expect(result.current.error).toBeNull();
  });

  it("sets an error when the job isn't in the dashboard", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({ total: 0, resumesGenerated: 0, referralsReady: 0, applied: 0, jobs: [] });

    const { result } = renderHook(() => useJobDetail("missing"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Job not found in dashboard");
  });

  it("updateStatus() patches the job and updates local pipeline state", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0,
      jobs: [{ job: { id: "job-1" }, status: "DISCOVERED" } as never]
    });
    vi.mocked(jobService.updateStatus).mockResolvedValue({ job: { id: "job-1" }, status: "SKIPPED" } as never);

    const { result } = renderHook(() => useJobDetail("job-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateStatus("SKIPPED" as never);
    });

    expect(result.current.pipeline?.status).toBe("SKIPPED");
  });

  it("updateStatus() throws when the patch fails, so callers can surface the error", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0,
      jobs: [{ job: { id: "job-1" }, status: "DISCOVERED" } as never]
    });
    vi.mocked(jobService.updateStatus).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useJobDetail("job-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.updateStatus("SKIPPED" as never)).rejects.toThrow("Failed to update status");
    expect(result.current.pipeline?.status).toBe("DISCOVERED");
  });
});
