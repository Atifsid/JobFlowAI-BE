import { Job } from "../../models/job.model";
import { AtsReport } from "../../models/ats-report.model";
import resumeService from "./resume.service";
import markdownService from "./markdown/markdown.service";
import pdfRenderService from "./pdf/pdf-render.service";
import resumeAIService from "./ai/resume-ai.service";
import atsCheckService from "./ats/ats-check.service";
import logger from "../../config/logger";

// Three tries at the gate; with best-attempt selection below, extra
// attempts can only improve the saved resume, never worsen it. ~35s per
// attempt on the local model.
const MAX_ATTEMPTS = 3;

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

    let best: { pdf: Buffer; ats: AtsReport } | undefined;
    let feedback: string | undefined;

    // Tailor -> render -> gate. On a failed gate, one retry with the
    // concrete failures fed back into the prompts. The BEST attempt is
    // what gets saved, not the last one - observed live: a retry that
    // chased missing keywords ballooned a one-page 63%-coverage draft
    // into a two-page 94% one, and the one-pager was the better resume.
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const newSkills = await resumeAIService.tailorSkills(skills, keywords, feedback);
      const newExperience = await resumeAIService.tailorExperience(experience, keywords, feedback);
      const newProjects = await resumeAIService.tailorProjects(projects, keywords, feedback);

      let tailored = markdownService.replace(master, "Skills", newSkills);
      tailored = markdownService.replace(tailored, "Experience", newExperience);
      tailored = markdownService.replace(tailored, "Projects", newProjects);

      const pdf = await pdfRenderService.render(tailored);

      const ats = atsCheckService.evaluate({
        markdown: tailored,
        pdf,
        keywords,
        masterExperience: experience,
        tailoredExperience: newExperience
      });

      if (!best || this.isBetter(ats, best.ats)) {
        best = { pdf, ats };
      }

      if (ats.passed) break;

      feedback = this.buildFeedback(ats);
      logger.warn(
        `ATS gate failed (attempt ${attempt}/${MAX_ATTEMPTS}) for "${job.title}" @ ${job.company}: ${feedback}`
      );
    }

    const { pdf, ats } = best as { pdf: Buffer; ats: AtsReport };
    const pdfPath = await resumeService.save(job.company, job.title, pdf);

    return { pdfPath, keywords, ats };
  }

  // Hard constraints first (one page, no dropped employers), keyword
  // coverage only as the tiebreaker: a one-page 63% resume beats a
  // two-page 94% one.
  private isBetter(candidate: AtsReport, current: AtsReport): boolean {
    if (candidate.passed !== current.passed) return candidate.passed;

    const candidateFits = candidate.pages <= 1;
    if (candidateFits !== (current.pages <= 1)) return candidateFits;

    const candidateKeepsEmployers = candidate.missingEmployers.length === 0;
    if (candidateKeepsEmployers !== (current.missingEmployers.length === 0)) {
      return candidateKeepsEmployers;
    }

    return candidate.score > current.score;
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
        `these roles were dropped from the work history: ${ats.missingEmployers.join("; ")} - every role must be kept with its exact title and company`
      );
    }

    // Always restate the standing constraints: a retry that only chases
    // missing keywords will happily blow past the page limit otherwise.
    issues.push(
      "while fixing this, stay within every original limit: the section bullet/line budgets and the one-page total are hard constraints"
    );

    return issues.join("; ");
  }
}

export default new ResumeTailorService();
