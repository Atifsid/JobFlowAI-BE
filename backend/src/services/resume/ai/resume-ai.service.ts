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
    const tailored = this.stripOverflowWarning(
      await aiService.tailorExperience(experience, jobDescription)
    );

    this.warnIfEmployerDropped(experience, tailored);

    return tailored;
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

  // The tailoring prompt requires every employer to be kept (no gaps in
  // the timeline), but smaller/local models don't always follow that
  // reliably - observed live with a 7B Ollama model silently dropping an
  // entire role. This can't fix a bad tailoring, but it makes sure a
  // dropped employer is loudly flagged rather than only caught by
  // proofreading the generated resume.
  private warnIfEmployerDropped(original: string, tailored: string): void {
    const employers = [...original.matchAll(/\*\*.+?\*\*\s*\|\s*(.+?)\s*\|/g)].map(
      match => match[1].trim()
    );

    const missing = employers.filter(employer => !tailored.includes(employer));

    if (missing.length > 0) {
      logger.warn(
        `Tailored Experience section is missing employer(s): ${missing.join(", ")}. The master resume rule requires keeping every employer - review this generated resume before sending it.`
      );
    }
  }
}

export default new ResumeAIService();
