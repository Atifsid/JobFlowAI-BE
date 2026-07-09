import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const { mockRun } = vi.hoisted(() => ({ mockRun: vi.fn() }));

vi.mock("../../src/workflows/find-employees-adhoc.workflow", () => ({
  default: { run: mockRun }
}));

const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

describe("POST /api/employees/find-adhoc", () => {
  beforeEach(() => {
    mockRun.mockReset();
  });

  it("looks up employees for the given company", async () => {
    mockRun.mockResolvedValue([employee]);

    const { default: app } = await import("../../src/app");
    const res = await request(app).post("/api/employees/find-adhoc").send({ company: "Acme" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([employee]);
    expect(mockRun).toHaveBeenCalledWith("Acme");
  });

  it("rejects a missing company with 400", async () => {
    const { default: app } = await import("../../src/app");
    const res = await request(app).post("/api/employees/find-adhoc").send({});

    expect(res.status).toBe(400);
    expect(mockRun).not.toHaveBeenCalled();
  });
});
