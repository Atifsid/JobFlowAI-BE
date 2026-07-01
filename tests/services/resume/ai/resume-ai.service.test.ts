import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockTailorSkills, mockTailorExperience, mockTailorProjects, mockWarn } =
  vi.hoisted(() => ({
    mockTailorSkills: vi.fn(),
    mockTailorExperience: vi.fn(),
    mockTailorProjects: vi.fn(),
    mockWarn: vi.fn()
  }));

vi.mock("../../../../src/services/ai/ai.service", () => ({
  default: {
    tailorSkills: mockTailorSkills,
    tailorExperience: mockTailorExperience,
    tailorProjects: mockTailorProjects
  }
}));

vi.mock("../../../../src/config/logger", () => ({
  default: { warn: mockWarn }
}));

import resumeAIService from "../../../../src/services/resume/ai/resume-ai.service";

describe("ResumeAIService", () => {
  beforeEach(() => {
    mockTailorSkills.mockReset();
    mockTailorExperience.mockReset();
    mockTailorProjects.mockReset();
    mockWarn.mockReset();
  });

  it("delegates tailorSkills to the AI service", async () => {
    mockTailorSkills.mockResolvedValue("tailored skills");

    const result = await resumeAIService.tailorSkills("React", "job desc");

    expect(mockTailorSkills).toHaveBeenCalledWith("React", "job desc");
    expect(result).toBe("tailored skills");
  });

  it("delegates tailorExperience to the AI service", async () => {
    mockTailorExperience.mockResolvedValue("tailored experience");

    const result = await resumeAIService.tailorExperience(
      "Built stuff",
      "job desc"
    );

    expect(mockTailorExperience).toHaveBeenCalledWith("Built stuff", "job desc");
    expect(result).toBe("tailored experience");
  });

  it("delegates tailorProjects to the AI service", async () => {
    mockTailorProjects.mockResolvedValue("tailored projects");

    const result = await resumeAIService.tailorProjects(
      "JobFlowAI",
      "job desc"
    );

    expect(mockTailorProjects).toHaveBeenCalledWith("JobFlowAI", "job desc");
    expect(result).toBe("tailored projects");
  });

  it("strips a trailing OVERFLOW WARNING and logs it instead of returning it", async () => {
    mockTailorSkills.mockResolvedValue(
      "TypeScript, React, Node.js\nOVERFLOW WARNING: this section is now longer than the original"
    );

    const result = await resumeAIService.tailorSkills("React", "job desc");

    expect(result).toBe("TypeScript, React, Node.js");
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining("OVERFLOW WARNING:")
    );
  });
});
