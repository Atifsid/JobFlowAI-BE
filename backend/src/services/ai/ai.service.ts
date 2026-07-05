import ProviderFactory from "./provider.factory";
import { AIMessage } from "./ai.types";
import { buildJobSummaryPrompt } from "../../prompts/job-summary.prompt";
import { buildExtractKeywordsPrompt } from "../../prompts/extract-keywords.prompt";
import { buildTailorSkillsPrompt } from "../../prompts/tailor-skills.prompt";
import { buildTailorExperiencePrompt } from "../../prompts/tailor-experience.prompt";
import { buildTailorProjectsPrompt } from "../../prompts/tailor-projects.prompt";

class AIService {
  private provider = ProviderFactory.get();

  async chat(messages: AIMessage[]) {
    return this.provider.chat(messages);
  }

  async summarizeJob(description: string) {
    return this.chat(buildJobSummaryPrompt(description));
  }

  async extractKeywords(jobDescription: string) {
    return this.chat(buildExtractKeywordsPrompt(jobDescription));
  }

  async tailorSkills(skills: string, keywords: string[]) {
    return this.chat(buildTailorSkillsPrompt(skills, keywords));
  }

  async tailorExperience(experience: string, keywords: string[]) {
    return this.chat(buildTailorExperiencePrompt(experience, keywords));
  }

  async tailorProjects(projects: string, keywords: string[]) {
    return this.chat(buildTailorProjectsPrompt(projects, keywords));
  }
}

export default new AIService();
