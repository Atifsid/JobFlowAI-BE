import { Job } from "../../models/job.model";
import resumeService from "./resume.service";
import docxService from "./docx/docx.service";
import resumeAIService from "./ai/resume-ai.service";

class ResumeTailorService {
  async generate(job: Job) {
    const template = await resumeService.getMasterTemplate();
    const master = await resumeService.getMasterResume();

    const skills = await resumeAIService.tailorSkills(
      master.skills,
      job.description
    );

    const experience = await resumeAIService.tailorExperience(
      master.experience,
      job.description
    );

    const projects = await resumeAIService.tailorProjects(
      master.projects,
      job.description
    );

    const output = docxService.render(template, {
      SKILLS_SECTION: skills,
      EXPERIENCE_BULLETS: experience,
      PROJECTS_SECTION: projects
    });

    const docPath = await resumeService.save(job.company, job.title, output);

    return { docPath };
  }
}

export default new ResumeTailorService();
