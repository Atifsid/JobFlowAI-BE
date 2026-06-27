import ProviderFactory from "./provider.factory";
import { AIMessage } from "./ai.types";
import { ResumeScore } from "../../models/resume-score.model";
import { parseJSON } from "../../utils/json";
import { buildJobSummaryPrompt } from "../../prompts/job-summary.prompt";
import { buildResumeScorePrompt } from "../../prompts/resume-score.prompt";
import { buildTailorResumePrompt } from "../../prompts/tailor-resume.prompt";

class AIService {
  private provider = ProviderFactory.get();

  async chat(messages: AIMessage[]) {
    return this.provider.chat(messages);
  }

  async summarizeJob(description: string) {
    return this.chat(buildJobSummaryPrompt(description));
  }

  async scoreResume(job: string, resume: string): Promise<ResumeScore> {
    const result = await this.chat(buildResumeScorePrompt(job, resume));
    return parseJSON<ResumeScore>(result);
  }

  async tailorResume(job: string, resume: string) {
    return this.chat(buildTailorResumePrompt(resume, job));
  }
}

export default new AIService();