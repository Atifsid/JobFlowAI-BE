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

    it("splits parenthesized compounds like 'JavaScript (React)' into separate keywords", async () => {
      mockExtractKeywords.mockResolvedValue('["JavaScript (React)", "C#"]');

      const result = await resumeAIService.extractKeywords("job desc");

      expect(result).toEqual(["JavaScript", "React", "C#"]);
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

    it("filters out activity/responsibility phrases the prompt forbids but the model leaks anyway", async () => {
      // Observed live: qwen2.5 extracted these despite the prompt's own
      // "never extract responsibilities or activity phrases" rule - each
      // became an uncatchable "true gap" since they're not real skills.
      mockExtractKeywords.mockResolvedValue(
        JSON.stringify([
          "React",
          "Code Review",
          "Web Development",
          "Full-Stack Engineering",
          "Web Performance Optimization",
          "Cross-Platform Compatibility",
          "Quantitative Analysis",
          "Research Tools",
          "Data Platforms",
          "Scalable Apps",
          "Travel Planning",
          "TypeScript"
        ])
      );

      const result = await resumeAIService.extractKeywords("job desc");

      expect(result).toEqual(["React", "TypeScript"]);
    });
  });

  it("delegates tailorSkills to the AI service with the keyword list", async () => {
    mockTailorSkills.mockResolvedValue("tailored skills");

    const result = await resumeAIService.tailorSkills("React", ["React", "AWS"]);

    expect(mockTailorSkills).toHaveBeenCalledWith("React", ["React", "AWS"], undefined);
    expect(result).toBe("tailored skills");
  });

  it("delegates tailorExperience to the AI service with the keyword list", async () => {
    mockTailorExperience.mockResolvedValue("tailored experience");

    const result = await resumeAIService.tailorExperience("Built stuff", ["AWS"]);

    expect(mockTailorExperience).toHaveBeenCalledWith("Built stuff", ["AWS"], undefined);
    expect(result).toBe("tailored experience");
  });

  it("delegates tailorProjects to the AI service with the keyword list", async () => {
    mockTailorProjects.mockResolvedValue("tailored projects");

    const result = await resumeAIService.tailorProjects("JobFlowAI", ["React"]);

    expect(mockTailorProjects).toHaveBeenCalledWith("JobFlowAI", ["React"], undefined);
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

  it("keeps the section content when the model puts the OVERFLOW WARNING first", async () => {
    // Observed live: the model led with the marker, and end-of-text
    // stripping deleted the entire Projects section, crashing the run.
    mockTailorProjects.mockResolvedValue(
      "OVERFLOW WARNING: might not fit\n\n**HRMS** — React Native\n- Built stuff."
    );

    const result = await resumeAIService.tailorProjects("JobFlowAI", ["React"]);

    expect(result).toBe("**HRMS** — React Native\n- Built stuff.");
    expect(mockWarn).toHaveBeenCalledWith("OVERFLOW WARNING: might not fit");
  });

  it("passes retry feedback through to the AI service", async () => {
    mockTailorSkills.mockResolvedValue("tailored");

    await resumeAIService.tailorSkills("React", ["React"], "missing: AWS");

    expect(mockTailorSkills).toHaveBeenCalledWith("React", ["React"], "missing: AWS");
  });

  it("strips a leading section-name label the model echoes back", async () => {
    mockTailorProjects.mockResolvedValue("Projects:\n**HRMS** — React Native\n- Built stuff.");

    const result = await resumeAIService.tailorProjects("JobFlowAI", ["React"]);

    expect(result).toBe("**HRMS** — React Native\n- Built stuff.");
  });

  it("throws when a section comes back empty after stripping the overflow marker", async () => {
    // Observed live: the model returned ONLY "OVERFLOW WARNING:" - left
    // unchecked this renders a resume with a silently missing section.
    mockTailorProjects.mockResolvedValue("OVERFLOW WARNING: too long");

    await expect(resumeAIService.tailorProjects("JobFlowAI", ["React"])).rejects.toThrow(
      "Tailored Projects section came back empty"
    );
  });
});
