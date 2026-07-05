import { Job } from "../../models/job.model";
import { AtsReport } from "../../models/ats-report.model";
import resumeService from "./resume.service";
import markdownService from "./markdown/markdown.service";
import pdfRenderService from "./pdf/pdf-render.service";
import resumeAIService from "./ai/resume-ai.service";
import atsCheckService from "./ats/ats-check.service";
import logger from "../../config/logger";

const MAX_ATTEMPTS = 2;

class ResumeTailorService {
  async generate(job: Job) {
    const master = await resumeService.getMasterResume();

    const skills = markdownService.extract(master, "Skills");
    const experience = markdownService.extract(master, "Experience");
    const projects = markdownService.extract(master, "Projects");

    // One extraction feeds all three sections, so they emphasize the
    // same keywords - and the keyword list is what the ATS gate verifies
    // the finished resume against.
    const keywords = await resumeAIService.extractKeywords(job.description);

    let pdf: Buffer = Buffer.alloc(0);
    let ats: AtsReport | undefined;
    let feedback: string | undefined;

    // Tailor -> render -> gate. On a failed gate, one retry with the
    // concrete failures fed back into the prompts; after that the resume
    // is saved anyway with the report attached, so the user sees exactly
    // what's still short rather than getting nothing.
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const newSkills = await resumeAIService.tailorSkills(skills, keywords, feedback);
      const newExperience = await resumeAIService.tailorExperience(experience, keywords, feedback);
      const newProjects = await resumeAIService.tailorProjects(projects, keywords, feedback);

      let tailored = markdownService.replace(master, "Skills", newSkills);
      tailored = markdownService.replace(tailored, "Experience", newExperience);
      tailored = markdownService.replace(tailored, "Projects", newProjects);

      pdf = await pdfRenderService.render(tailored);

      ats = atsCheckService.evaluate({
        markdown: tailored,
        pdf,
        keywords,
        masterExperience: experience,
        tailoredExperience: newExperience
      });

      if (ats.passed) break;

      feedback = this.buildFeedback(ats);
      logger.warn(
        `ATS gate failed (attempt ${attempt}/${MAX_ATTEMPTS}) for "${job.title}" @ ${job.company}: ${feedback}`
      );
    }

    const pdfPath = await resumeService.save(job.company, job.title, pdf);

    return { pdfPath, keywords, ats: ats as AtsReport };
  }

  private buildFeedback(ats: AtsReport): string {
    const issues: string[] = [];

    if (ats.missingKeywords.length > 0) {
      issues.push(
        `these target keywords are missing from the resume: ${ats.missingKeywords.join(", ")} - work the ones that are truthful for this candidate into the section text`
      );
    }
    if (ats.pages > 1) {
      issues.push(
        `the resume rendered to ${ats.pages} pages - condense further, it must fit one page`
      );
    }
    if (ats.missingEmployers.length > 0) {
      issues.push(
        `these employers were dropped from the work history: ${ats.missingEmployers.join(", ")} - every employer must be kept`
      );
    }

    return issues.join("; ");
  }
}

export default new ResumeTailorService();
