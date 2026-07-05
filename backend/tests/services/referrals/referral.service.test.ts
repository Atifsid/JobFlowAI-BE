import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockChat, mockWarn } = vi.hoisted(() => ({
  mockChat: vi.fn(),
  mockWarn: vi.fn()
}));

vi.mock("../../../src/services/ai/ai.service", () => ({
  default: { chat: mockChat }
}));

vi.mock("../../../src/config/logger", () => ({
  default: { warn: mockWarn }
}));

import referralService from "../../../src/services/referrals/referral.service";
import { Job } from "../../../src/models/job.model";
import { Employee } from "../../../src/models/employee.model";

const job: Job = {
  id: "1",
  title: "Engineer",
  company: "Acme",
  location: "NYC",
  remote: false,
  description: "",
  skills: [],
  applyUrl: "https://x.com",
  source: "test"
};

const employee: Employee = {
  name: "Sarah Chen",
  title: "Engineer",
  company: "Acme",
  linkedin: "https://linkedin.com/in/sarah"
};

describe("ReferralService.generate", () => {
  beforeEach(() => {
    mockChat.mockReset();
    mockWarn.mockReset();
  });

  it("returns the draft as-is when it fits the 200-character limit", async () => {
    mockChat.mockResolvedValue("Hey Sarah - saw the Engineer opening at Acme. Any chance of a referral?");

    const result = await referralService.generate(job, employee, "https://drive.example/r");

    expect(result.length).toBeLessThanOrEqual(200);
    expect(mockChat).toHaveBeenCalledTimes(1);
  });

  it("includes the resume link in the prompt when provided", async () => {
    mockChat.mockResolvedValue("short note");

    await referralService.generate(job, employee, "https://drive.example/r");

    const messages = mockChat.mock.calls[0][0];
    expect(messages[1].content).toContain("https://drive.example/r");
    expect(messages[0].content).toContain("Include the resume link");
  });

  it("tells the model not to invent a link when none is provided", async () => {
    mockChat.mockResolvedValue("short note");

    await referralService.generate(job, employee);

    const messages = mockChat.mock.calls[0][0];
    expect(messages[0].content).toContain("don't mention or invent one");
    expect(messages[1].content).not.toContain("Resume:");
  });

  it("retries once with feedback when the draft exceeds 200 characters", async () => {
    mockChat
      .mockResolvedValueOnce("x".repeat(250))
      .mockResolvedValueOnce("short enough now");

    const result = await referralService.generate(job, employee);

    expect(result).toBe("short enough now");
    expect(mockChat).toHaveBeenCalledTimes(2);
    const retryMessages = mockChat.mock.calls[1][0];
    expect(retryMessages[1].content).toContain("250 characters");
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining("retrying once"));
  });

  it("trims at a word boundary when the retry is still too long", async () => {
    const words = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    mockChat.mockResolvedValue(words);

    const result = await referralService.generate(job, employee);

    expect(result.length).toBeLessThanOrEqual(200);
    expect(result.endsWith("word")).toBe(false);
    expect(words.startsWith(result)).toBe(true);
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining("trimming"));
  });
});
