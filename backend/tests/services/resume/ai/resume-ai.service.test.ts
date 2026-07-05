import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockExtractKeywords, mockTailorSkills, mockTailorExperience, mockTailorProjects, mockWarn } =
  vi.hoisted(() => ({
    mockExtractKeywords: vi.fn(),
    mockTailorSkills: vi.fn(),
    mockTailorExperience: vi.fn(),
    mockTailorProjects: vi.fn(),
    mockWarn: vi.fn()
  }));

vi.mock("../../../../src/services/ai/ai.service", () => ({
  default: {
    extractKeywords: mockExtractKeywords,
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
    mockExtractKeywords.mockReset();
    mockTailorSkills.mockReset();
    mockTailorExperience.mockReset();
    mockTailorProjects.mockReset();
    mockWarn.mockReset();
  });

  describe("extractKeywords", () => {
    it("parses a clean JSON array", async () => {
      mockExtractKeywords.mockResolvedValue('["React", "TypeScript", "AWS"]');

      const result = await resumeAIService.extractKeywords("job desc");

      expect(result).toEqual(["React", "TypeScript", "AWS"]);
    });

    it("tolerates markdown fences and surrounding prose", async () => {
      mockExtractKeywords.mockResolvedValue(
        'Here are the keywords:\n```json\n["React", "Node.js"]\n```\nLet me know if you need more!'
      );

      const result = await resumeAIService.extractKeywords("job desc");

      expect(result).toEqual(["React", "Node.js"]);
    });

    it("dedupes, trims, and caps at 20 keywords", async () => {
      const thirty = Array.from({ length: 30 }, (_, i) => `"kw-${i} "`).join(",");
      mockExtractKeywords.mockResolvedValue(`[${thirty}, "kw-0"]`);

      const result = await resumeAIService.extractKeywords("job desc");

      expect(result).toHaveLength(20);
      expect(result[0]).toBe("kw-0");
      expect(new Set(result).size).toBe(20);
    });

    it("retries once on unparseable output, then succeeds", async () => {
      mockExtractKeywords
        .mockResolvedValueOnce("I could not find any keywords, sorry.")
        .mockResolvedValueOnce('["React"]');

      const result = await resumeAIService.extractKeywords("job desc");

      expect(result).toEqual(["React"]);
      expect(mockExtractKeywords).toHaveBeenCalledTimes(2);
      expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining("retrying"));
    });

    it("throws after two unparseable responses", async () => {
      mockExtractKeywords.mockResolvedValue("not json at all");

      await expect(resumeAIService.extractKeywords("job desc")).rejects.toThrow(
        "Keyword extraction failed"
      );
      expect(mockExtractKeywords).toHaveBeenCalledTimes(2);
    });

    it("rejects an array with no usable strings", async () => {
      mockExtractKeywords.mockResolvedValue("[1, 2, null]");

      await expect(resumeAIService.extractKeywords("job desc")).rejects.toThrow(
        "Keyword extraction failed"
      );
    });
  });

  it("delegates tailorSkills to the AI service with the keyword list", async () => {
    mockTailorSkills.mockResolvedValue("tailored skills");

    const result = await resumeAIService.tailorSkills("React", ["React", "AWS"]);

    expect(mockTailorSkills).toHaveBeenCalledWith("React", ["React", "AWS"]);
    expect(result).toBe("tailored skills");
  });

  it("delegates tailorExperience to the AI service with the keyword list", async () => {
    mockTailorExperience.mockResolvedValue("tailored experience");

    const result = await resumeAIService.tailorExperience("Built stuff", ["AWS"]);

    expect(mockTailorExperience).toHaveBeenCalledWith("Built stuff", ["AWS"]);
    expect(result).toBe("tailored experience");
  });

  it("delegates tailorProjects to the AI service with the keyword list", async () => {
    mockTailorProjects.mockResolvedValue("tailored projects");

    const result = await resumeAIService.tailorProjects("JobFlowAI", ["React"]);

    expect(mockTailorProjects).toHaveBeenCalledWith("JobFlowAI", ["React"]);
    expect(result).toBe("tailored projects");
  });

  it("strips a trailing OVERFLOW WARNING and logs it instead of returning it", async () => {
    mockTailorSkills.mockResolvedValue(
      "TypeScript, React, Node.js\nOVERFLOW WARNING: this section is now longer than the original"
    );

    const result = await resumeAIService.tailorSkills("React", ["React"]);

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

    await resumeAIService.tailorExperience(original, ["React"]);

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

    await resumeAIService.tailorExperience(original, ["React"]);

    expect(mockWarn).not.toHaveBeenCalled();
  });
});
