import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import { jobService } from "../services/jobService";

vi.mock("../services/jobService", () => ({
  jobService: { updateStatus: vi.fn() }
}));

describe("useJobStatusUpdate", () => {
  afterEach(() => {
    vi.mocked(jobService.updateStatus).mockReset();
  });

  it("returns the updated pipeline on success", async () => {
    vi.mocked(jobService.updateStatus).mockResolvedValue({ status: "APPLIED" } as never);
    const { result } = renderHook(() => useJobStatusUpdate());

    let updated;
    await act(async () => {
      updated = await result.current.updateStatus("job-1", "APPLIED" as never);
    });

    expect(updated).toEqual({ status: "APPLIED" });
    expect(result.current.error).toBeNull();
  });

  it("sets error and returns null on failure", async () => {
    vi.mocked(jobService.updateStatus).mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useJobStatusUpdate());

    let updated;
    await act(async () => {
      updated = await result.current.updateStatus("job-1", "APPLIED" as never);
    });

    expect(updated).toBeNull();
    expect(result.current.error).toBe("boom");
  });
});
