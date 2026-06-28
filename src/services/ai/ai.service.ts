import ProviderFactory from "./provider.factory";
import { AIMessage } from "./ai.types";
import { buildJobSummaryPrompt } from "../../prompts/job-summary.prompt";
import { buildResumeTailorPrompt } from "../../prompts/tailor-resume.prompt";

class AIService {
  private provider = ProviderFactory.get();

  async chat(messages: AIMessage[]) {
    return this.provider.chat(messages);
  }

  async summarizeJob(description: string) {
    return this.chat(buildJobSummaryPrompt(description));
  }

  async tailorResume(job: string, resume: string) {
    return this.chat(buildResumeTailorPrompt(resume, job));
  }
}

export default new AIService();