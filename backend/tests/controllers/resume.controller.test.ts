import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const { mockRun } = vi.hoisted(() => ({ mockRun: vi.fn() }));

vi.mock("../../src/workflows/generate-resume-adhoc.workflow", () => ({
  default: { run: mockRun }
}));

const description = "A".repeat(60);

describe("POST /api/resume/generate-adhoc", () => {
  beforeEach(() => {
    mockRun.mockReset();
  });

  it("builds a resume from title/company/description and returns it", async () => {
    mockRun.mockResolvedValue({ pdfPath: "a.pdf", ats: { passed: true } });

    const { default: app } = await import("../../src/app");
    const res = await request(app)
      .post("/api/resume/generate-adhoc")
      .send({ title: "Engineer", company: "Acme", description });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ pdfPath: "a.pdf", ats: { passed: true } });
    expect(mockRun).toHaveBeenCalledWith({ title: "Engineer", company: "Acme", description });
  });

  it("rejects a description under 50 characters with 400", async () => {
    const { default: app } = await import("../../src/app");
    const res = await request(app)
      .post("/api/resume/generate-adhoc")
      .send({ title: "Engineer", company: "Acme", description: "too short" });

    expect(res.status).toBe(400);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("rejects a missing company with 400", async () => {
    const { default: app } = await import("../../src/app");
    const res = await request(app)
      .post("/api/resume/generate-adhoc")
      .send({ title: "Engineer", description });

    expect(res.status).toBe(400);
    expect(mockRun).not.toHaveBeenCalled();
  });
});
