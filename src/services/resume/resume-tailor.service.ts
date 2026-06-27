import { Job } from "../../models/job.model";
import aiService from "../ai/ai.service";
import resumeService from "./resume.service";

class ResumeTailorService {
  async generate(job: Job) {
    const resume = await resumeService.getMaster();
    const tailored = await aiService.tailorResume(job.description, resume.content);
    return resumeService.save(job.company, job.title, tailored);
  }
}

export default new ResumeTailorService();