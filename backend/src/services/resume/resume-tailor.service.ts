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

    const newSkills = await resumeAIService.tailorSkills(
      skills,
      job.description
    );

    const newExperience = await resumeAIService.tailorExperience(
      experience,
      job.description
    );

    const newProjects = await resumeAIService.tailorProjects(
      projects,
      job.description
    );

    let tailored = master;
    tailored = markdownService.replace(tailored, "Skills", newSkills);
    tailored = markdownService.replace(tailored, "Experience", newExperience);
    tailored = markdownService.replace(tailored, "Projects", newProjects);

    const pdf = await pdfRenderService.render(tailored);
    const pdfPath = await resumeService.save(job.company, job.title, pdf);

    return { pdfPath };
  }
}

export default new ResumeTailorService();
