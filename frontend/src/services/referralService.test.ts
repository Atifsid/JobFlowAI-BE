import { describe, it, expect, vi, afterEach } from "vitest";
import { referralService } from "./referralService";

describe("referralService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generateDrafts() posts to /api/referral/generate/:jobId", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await referralService.generateDrafts("job-1");

    expect(fetchMock).toHaveBeenCalledWith("/api/referral/generate/job-1", expect.objectContaining({ method: "POST" }));
  });
});
