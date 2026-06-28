import { Job } from "../../models/job.model";
import selector from "./selector/resume-selector.service";
import resumeService from "./resume.service";
import latexService from "./latex/latex.service";
import resumeAIService from "./ai/resume-ai.service";

class ResumeTailorService {
  async generate(job: Job) {
    const template = selector.select(job.description);

    const latex = await resumeService.getTemplate(template);

    const skills = latexService.extract(latex, "SKILLS");
    const experience = latexService.extract(latex, "EXPERIENCE");
    const projects = latexService.extract(latex, "PROJECTS");

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

    let output = latex;

    output = latexService.replace(output, "SKILLS", newSkills);
    output = latexService.replace(output, "EXPERIENCE", newExperience);
    output = latexService.replace(output, "PROJECTS", newProjects);

    const texPath = await resumeService.save(
      job.company,
      job.title,
      output
    );

    return {
      template,
      tex: texPath
    };
  }
}

export default new ResumeTailorService();