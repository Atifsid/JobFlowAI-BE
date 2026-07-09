import { describe, it, expect, vi, afterEach } from "vitest";
import { employeeService } from "./employeeService";

describe("employeeService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("find() posts to /api/employees/find/:jobId", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await employeeService.find("job-1");

    expect(fetchMock).toHaveBeenCalledWith("/api/employees/find/job-1", expect.objectContaining({ method: "POST" }));
  });

  it("findAdhoc() posts to /api/employees/find-adhoc with the company name", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: "ok", data: [] })
    });
    vi.stubGlobal("fetch", fetchMock);

    await employeeService.findAdhoc("Acme");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/employees/find-adhoc",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ company: "Acme" }) })
    );
  });
});
