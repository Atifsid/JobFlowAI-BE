import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJobSearch } from "./useJobSearch";
import { jobService } from "../services/jobService";

vi.mock("../services/jobService", () => ({
  jobService: { search: vi.fn() }
}));

describe("useJobSearch", () => {
  afterEach(() => {
    vi.mocked(jobService.search).mockReset();
  });

  it("debounces search calls by 300ms", async () => {
    vi.mocked(jobService.search).mockResolvedValue({ total: 1, referral: 0, directApply: 1, skip: 0, jobs: [] });

    const { result } = renderHook(() => useJobSearch());

    act(() => {
      result.current.search({ title: "Engineer" });
    });

    expect(jobService.search).not.toHaveBeenCalled();

    await waitFor(() => expect(jobService.search).toHaveBeenCalledWith({ title: "Engineer" }), { timeout: 1000 });
    await waitFor(() => expect(result.current.result?.total).toBe(1));
  });
});
