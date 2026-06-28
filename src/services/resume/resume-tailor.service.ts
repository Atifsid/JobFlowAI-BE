import { Job } from "../../models/job.model";
import aiService from "../ai/ai.service";
import resumeService from "./resume.service";
import selector from "./selector/resume-selector.service";

class ResumeTailorService {
  async generate(job: Job) {
    const template = selector.select(job.description);
    const resume = await resumeService.getTemplate(template);
    const tailored = await aiService.tailorResume(
      job.description,
      resume
    );
  }
}

export default new ResumeTailorService();