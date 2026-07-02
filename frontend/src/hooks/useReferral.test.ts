import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReferral } from "./useReferral";
import { referralService } from "../services/referralService";

vi.mock("../services/referralService", () => ({
  referralService: { generateDrafts: vi.fn() }
}));

describe("useReferral", () => {
  afterEach(() => {
    vi.mocked(referralService.generateDrafts).mockReset();
  });

  it("generate() populates drafts on success", async () => {
    vi.mocked(referralService.generateDrafts).mockResolvedValue([
      { employee: { name: "Sarah", title: "Eng", company: "Acme", linkedin: "https://linkedin.com/in/sarah" }, message: "Hi Sarah" }
    ]);

    const { result } = renderHook(() => useReferral("job-1"));

    await act(async () => {
      await result.current.generate();
    });

    expect(result.current.drafts).toHaveLength(1);
  });
});
