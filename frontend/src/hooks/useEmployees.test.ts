import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmployees } from "./useEmployees";
import { employeeService } from "../services/employeeService";

vi.mock("../services/employeeService", () => ({
  employeeService: { find: vi.fn() }
}));

describe("useEmployees", () => {
  afterEach(() => {
    vi.mocked(employeeService.find).mockReset();
  });

  it("find() populates employees on success", async () => {
    vi.mocked(employeeService.find).mockResolvedValue([{ name: "Sarah", title: "Eng", company: "Acme", linkedin: "https://linkedin.com/in/sarah" }]);

    const { result } = renderHook(() => useEmployees("job-1"));

    await act(async () => {
      await result.current.find();
    });

    expect(result.current.employees).toHaveLength(1);
  });
});
