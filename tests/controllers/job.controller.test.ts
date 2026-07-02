import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const { mockRun } = vi.hoisted(() => ({ mockRun: vi.fn() }));

vi.mock("../../src/workflows/update-job-status.workflow", () => ({
  default: { run: mockRun }
}));

describe("PATCH /api/jobs/:jobId/status", () => {
  beforeEach(() => {
    mockRun.mockReset();
  });

  it("updates status and returns the updated pipeline", async () => {
    mockRun.mockResolvedValue({ job: { id: "job-1" }, status: "APPLIED" });

    const { default: app } = await import("../../src/app");
    const res = await request(app)
      .patch("/api/jobs/job-1/status")
      .send({ status: "APPLIED" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ job: { id: "job-1" }, status: "APPLIED" });
    expect(mockRun).toHaveBeenCalledWith({ jobId: "job-1", status: "APPLIED" });
  });

  it("rejects an invalid status with 400", async () => {
    const { default: app } = await import("../../src/app");
    const res = await request(app)
      .patch("/api/jobs/job-1/status")
      .send({ status: "NOT_A_REAL_STATUS" });

    expect(res.status).toBe(400);
    expect(mockRun).not.toHaveBeenCalled();
  });
});
