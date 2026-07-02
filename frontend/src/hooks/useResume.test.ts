import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useResume } from "./useResume";
import { resumeService } from "../services/resumeService";

vi.mock("../services/resumeService", () => ({
  resumeService: { generate: vi.fn() }
}));

describe("useResume", () => {
  afterEach(() => {
    vi.mocked(resumeService.generate).mockReset();
  });

  it("generate() populates resume on success", async () => {
    vi.mocked(resumeService.generate).mockResolvedValue({ pdfPath: "storage/resumes/generated/a.pdf" });

    const { result } = renderHook(() => useResume("job-1"));

    await act(async () => {
      await result.current.generate();
    });

    expect(result.current.resume?.pdfPath).toBe("storage/resumes/generated/a.pdf");
    expect(result.current.generating).toBe(false);
  });

  it("generate() sets an error message on failure", async () => {
    vi.mocked(resumeService.generate).mockRejectedValue(new Error("tailor failed"));

    const { result } = renderHook(() => useResume("job-1"));

    await act(async () => {
      await result.current.generate();
    });

    expect(result.current.error).toBe("tailor failed");
  });
});
