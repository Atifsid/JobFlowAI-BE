import { Job } from "../../models/job.model";
import resumeService from "./resume.service";
import markdownService from "./markdown/markdown.service";
import pdfRenderService from "./pdf/pdf-render.service";
import resumeAIService from "./ai/resume-ai.service";

class ResumeTailorService {
  async generate(job: Job) {
    const master = await resumeService.getMasterResume();

    const skills = markdownService.extract(master, "Skills");
    const experience = markdownService.extract(master, "Experience");
    const projects = markdownService.extract(master, "Projects");

    // One extraction feeds all three sections, so they emphasize the
    // same keywords - and the keyword list is what the ATS gate later
    // verifies the finished resume against.
    const keywords = await resumeAIService.extractKeywords(job.description);

    const newSkills = await resumeAIService.tailorSkills(skills, keywords);

    const newExperience = await resumeAIService.tailorExperience(
      experience,
      keywords
    );

    const newProjects = await resumeAIService.tailorProjects(
      projects,
      keywords
    );

    let tailored = master;
    tailored = markdownService.replace(tailored, "Skills", newSkills);
    tailored = markdownService.replace(tailored, "Experience", newExperience);
    tailored = markdownService.replace(tailored, "Projects", newProjects);

    const pdf = await pdfRenderService.render(tailored);
    const pdfPath = await resumeService.save(job.company, job.title, pdf);

    return { pdfPath, keywords };
  }
}

export default new ResumeTailorService();
