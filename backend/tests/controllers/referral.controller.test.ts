import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const { mockRun } = vi.hoisted(() => ({ mockRun: vi.fn() }));

vi.mock("../../src/workflows/generate-referral-adhoc.workflow", () => ({
  default: { run: mockRun }
}));

const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

describe("POST /api/referral/generate-adhoc", () => {
  beforeEach(() => {
    mockRun.mockReset();
  });

  it("drafts referral messages for the given job", async () => {
    mockRun.mockResolvedValue([{ employee, message: "Hey Sarah" }]);

    const { default: app } = await import("../../src/app");
    const res = await request(app)
      .post("/api/referral/generate-adhoc")
      .send({ title: "Engineer", company: "Acme" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ employee, message: "Hey Sarah" }]);
    expect(mockRun).toHaveBeenCalledWith({ title: "Engineer", company: "Acme" });
  });

  it("rejects a missing title with 400", async () => {
    const { default: app } = await import("../../src/app");
    const res = await request(app).post("/api/referral/generate-adhoc").send({ company: "Acme" });

    expect(res.status).toBe(400);
    expect(mockRun).not.toHaveBeenCalled();
  });
});
