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

  it("generateAdhoc() posts to /api/resume/generate-adhoc with title/company/description", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: { pdfPath: "a.pdf" } })
    });
    vi.stubGlobal("fetch", fetchMock);

    await resumeService.generateAdhoc({ title: "Engineer", company: "Acme", description: "A JD" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/resume/generate-adhoc",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Engineer", company: "Acme", description: "A JD" })
      })
    );
  });
});
