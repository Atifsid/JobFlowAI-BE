import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboard } from "./useDashboard";
import { dashboardService } from "../services/dashboardService";

vi.mock("../services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn() }
}));

describe("useDashboard", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockReset();
  });

  it("loads the dashboard on mount", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({ total: 3, referral: 1, directApply: 1, skip: 1, jobs: [] });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.dashboard?.total).toBe(3);
    expect(result.current.error).toBeNull();
  });

  it("sets an error message when the fetch fails", async () => {
    vi.mocked(dashboardService.getDashboard).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("network down");
  });
});
