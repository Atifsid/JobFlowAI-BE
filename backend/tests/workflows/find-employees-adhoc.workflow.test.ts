import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFind } = vi.hoisted(() => ({ mockFind: vi.fn() }));

vi.mock("../../src/services/employees/employee.service", () => ({
  default: { find: mockFind }
}));

import workflow from "../../src/workflows/find-employees-adhoc.workflow";

const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

describe("FindEmployeesAdhocWorkflow.run", () => {
  beforeEach(() => {
    mockFind.mockReset().mockResolvedValue([employee]);
  });

  it("looks up employees by company directly, with no job-cache involved", async () => {
    const result = await workflow.run("Acme");

    expect(mockFind).toHaveBeenCalledWith("Acme");
    expect(result).toEqual([employee]);
  });
});
