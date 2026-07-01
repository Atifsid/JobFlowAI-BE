import aiService from "../../ai/ai.service";
import logger from "../../../config/logger";

const OVERFLOW_MARKER = "OVERFLOW WARNING:";

class ResumeAIService {
  async tailorSkills(skills: string, jobDescription: string) {
    return this.stripOverflowWarning(
      await aiService.tailorSkills(skills, jobDescription)
    );
  }

  async tailorExperience(experience: string, jobDescription: string) {
    return this.stripOverflowWarning(
      await aiService.tailorExperience(experience, jobDescription)
    );
  }

  async tailorProjects(projects: string, jobDescription: string) {
    return this.stripOverflowWarning(
      await aiService.tailorProjects(projects, jobDescription)
    );
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
