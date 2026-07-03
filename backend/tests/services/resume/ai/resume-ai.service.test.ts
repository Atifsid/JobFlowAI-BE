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

  it("warns when the tailored Experience section drops an employer", async () => {
    const original = `**Senior Engineer** | Acme Corp | Jan 2024 – Present
- Did stuff.

**Engineer** | Beta Inc | Jan 2020 – Jan 2024
- Did other stuff.`;

    mockTailorExperience.mockResolvedValue(
      "**Senior Engineer** | Acme Corp | Jan 2024 – Present\n- Did stuff."
    );

    await resumeAIService.tailorExperience(original, "job desc");

    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining("Beta Inc")
    );
  });

  it("does not warn when every employer is kept in the tailored Experience section", async () => {
    const original = `**Senior Engineer** | Acme Corp | Jan 2024 – Present
- Did stuff.

**Engineer** | Beta Inc | Jan 2020 – Jan 2024
- Did other stuff.`;

    mockTailorExperience.mockResolvedValue(original);

    await resumeAIService.tailorExperience(original, "job desc");

    expect(mockWarn).not.toHaveBeenCalled();
  });
});
