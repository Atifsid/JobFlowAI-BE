import { describe, it, expect, vi, afterEach } from "vitest";
import { resumeService } from "./resumeService";

describe("resumeService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generate() posts to /api/resume/generate/:jobId", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: { pdfPath: "a.pdf" } })
    });
    vi.stubGlobal("fetch", fetchMock);

    await resumeService.generate("job-1");

    expect(fetchMock).toHaveBeenCalledWith("/api/resume/generate/job-1", expect.objectContaining({ method: "POST" }));
  });
});
