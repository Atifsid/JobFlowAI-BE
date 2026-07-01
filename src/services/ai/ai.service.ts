import ProviderFactory from "./provider.factory";
import { AIMessage } from "./ai.types";
import { buildJobSummaryPrompt } from "../../prompts/job-summary.prompt";
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

  async tailorSkills(skills: string, jobDescription: string) {
    return this.chat(buildTailorSkillsPrompt(skills, jobDescription));
  }

  async tailorExperience(experience: string, jobDescription: string) {
    return this.chat(buildTailorExperiencePrompt(experience, jobDescription));
  }

  async tailorProjects(projects: string, jobDescription: string) {
    return this.chat(buildTailorProjectsPrompt(projects, jobDescription));
  }
}

export default new AIService();