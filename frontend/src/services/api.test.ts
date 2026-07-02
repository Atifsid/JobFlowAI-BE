import { describe, it, expect, vi, afterEach } from "vitest";
import { request } from "./api";

describe("request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns data on a successful envelope", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: { foo: "bar" } })
    }));

    const result = await request<{ foo: string }>("/api/thing");

    expect(result).toEqual({ foo: "bar" });
  });

  it("throws the envelope's message when success is false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, message: "nope" })
    }));

    await expect(request("/api/thing")).rejects.toThrow("nope");
  });

  it("throws when the HTTP response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, message: "" })
    }));

    await expect(request("/api/thing")).rejects.toThrow("Request to /api/thing failed");
  });
});
