import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFind, mockGenerate } = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockGenerate: vi.fn()
}));

vi.mock("../../src/services/employees/employee.service", () => ({
  default: { find: mockFind }
}));
vi.mock("../../src/services/referrals/referral.service", () => ({
  default: { generate: mockGenerate }
}));

import workflow from "../../src/workflows/generate-referral-adhoc.workflow";

const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

describe("GenerateReferralAdhocWorkflow.run", () => {
  beforeEach(() => {
    mockFind.mockReset().mockResolvedValue([employee]);
    mockGenerate.mockReset().mockResolvedValue("Hey Sarah - quick note");
  });

  it("finds employees for the given company and drafts a message per employee, passing the driveLink through", async () => {
    const result = await workflow.run({ title: "Engineer", company: "Acme", driveLink: "https://drive.example/resume" });

    expect(mockFind).toHaveBeenCalledWith("Acme");
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Engineer", company: "Acme" }),
      employee,
      "https://drive.example/resume"
    );
    expect(result).toEqual([{ employee, message: "Hey Sarah - quick note" }]);
  });

  it("passes no resume link when none is given", async () => {
    await workflow.run({ title: "Engineer", company: "Acme" });

    expect(mockGenerate).toHaveBeenCalledWith(expect.anything(), employee, undefined);
  });
});
