import aiService from "../../ai/ai.service";
import logger from "../../../config/logger";

const OVERFLOW_MARKER = "OVERFLOW WARNING:";
const MAX_KEYWORDS = 20;

class ResumeAIService {
  // Asks the model for the JD's target keywords as a JSON array. Local
  // models don't always return clean JSON, so parsing is defensive
  // (fences/prose tolerated) with one retry before giving up - the
  // keywords feed both the tailoring prompts and the ATS gate, so
  // generation can't proceed without them.
  async extractKeywords(jobDescription: string): Promise<string[]> {
    const first = this.parseKeywords(await aiService.extractKeywords(jobDescription));
    if (first) return first;

    logger.warn("Keyword extraction returned unparseable output, retrying once");

    const second = this.parseKeywords(await aiService.extractKeywords(jobDescription));
    if (second) return second;

    throw new Error(
      "Keyword extraction failed: the model did not return a JSON array of keywords"
    );
  }

  async tailorSkills(skills: string, keywords: string[], feedback?: string) {
    return this.stripOverflowWarning(
      await aiService.tailorSkills(skills, keywords, feedback)
    );
  }

  async tailorExperience(experience: string, keywords: string[], feedback?: string) {
    return this.stripOverflowWarning(
      await aiService.tailorExperience(experience, keywords, feedback)
    );
  }

  async tailorProjects(projects: string, keywords: string[], feedback?: string) {
    return this.stripOverflowWarning(
      await aiService.tailorProjects(projects, keywords, feedback)
    );
  }

  // Tolerates markdown fences and surrounding prose: grabs the first
  // [...] span and JSON-parses just that. Returns null when there's no
  // usable string array inside.
  private parseKeywords(text: string): string[] | null {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end <= start) return null;

    try {
      const parsed: unknown = JSON.parse(text.slice(start, end + 1));
      if (!Array.isArray(parsed)) return null;

      const keywords = [
        ...new Set(
          parsed
            .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
            .map(k => k.trim())
        )
      ];

      return keywords.length > 0 ? keywords.slice(0, MAX_KEYWORDS) : null;
    } catch {
      return null;
    }
  }

  // The tailoring prompts ask the model to flag likely one-page overflow
  // with a trailing "OVERFLOW WARNING: ..." note. Left in, that text
  // would render as visible resume content - strip it and log it instead.
  private stripOverflowWarning(text: string): string {
    const index = text.indexOf(OVERFLOW_MARKER);
    if (index === -1) return text.trim();

    logger.warn(text.slice(index).trim());
    return text.slice(0, index).trim();
  }
}

export default new ResumeAIService();
