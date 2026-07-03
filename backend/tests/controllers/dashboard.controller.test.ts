import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const { mockGetAll, mockBuild } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockBuild: vi.fn()
}));

vi.mock("../../src/services/jobs/job-cache.service", () => ({
  default: { getAll: mockGetAll }
}));

vi.mock("../../src/services/dashboard/dashboard.service", () => ({
  default: { build: mockBuild }
}));

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    mockGetAll.mockReset();
    mockBuild.mockReset();
  });

  it("returns the dashboard built from every cached job, without re-running search", async () => {
    mockGetAll.mockResolvedValue([{ job: { id: "1" } }]);
    mockBuild.mockReturnValue({ total: 1, referral: 0, directApply: 1, skip: 0, jobs: [] });

    const { default: app } = await import("../../src/app");
    const res = await request(app).get("/api/dashboard");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ total: 1, referral: 0, directApply: 1, skip: 0, jobs: [] });
    expect(mockGetAll).toHaveBeenCalled();
  });
});
