import { Job } from "../../models/job.model";
import { AtsReport } from "../../models/ats-report.model";
import resumeService from "./resume.service";
import markdownService from "./markdown/markdown.service";
import pdfRenderService from "./pdf/pdf-render.service";
import resumeAIService from "./ai/resume-ai.service";
import atsCheckService from "./ats/ats-check.service";
import resumeFitService, { ResumeSections } from "./fit/resume-fit.service";
import logger from "../../config/logger";

// Retries exist for keyword coverage only - page fit is enforced
// deterministically below, so it can't fail the gate anymore.
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

    // Only keywords the master resume actually contains are worth
    // tailoring toward - the rest are true fit gaps that no honest
    // resume can claim. Feeding them to the model just invites
    // fabrication, and gating on them made poor-fit jobs unpassable.
    const { claimable, unclaimable } = atsCheckService.partitionClaimable(master, keywords);

    if (unclaimable.length > 0) {
      logger.warn(
        `JD keywords not in the master resume (true gaps, excluded from tailoring/gate): ${unclaimable.join(", ")}`
      );
    }

    let best: { pdf: Buffer; ats: AtsReport } | undefined;
    let feedback: string | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let sections: ResumeSections = {
        skills: await resumeAIService.tailorSkills(skills, claimable, feedback),
        experience: await resumeAIService.tailorExperience(experience, claimable, feedback),
        projects: await resumeAIService.tailorProjects(projects, claimable, feedback)
      };

      // Code enforces the content budgets the prompts ask for - the
      // model's overshoot stops mattering.
      sections = resumeFitService.enforceBudgets(sections);

      let tailored = this.assemble(master, sections);
      let pdf = await pdfRenderService.render(tailored);

      // Still over one page? Trim one item at a time (least valuable
      // content first) and re-render until it fits. Deterministic, no
      // AI calls, converges in a handful of ~300ms renders.
      while (atsCheckService.countPdfPages(pdf) > 1) {
        const trimmed = resumeFitService.trimOneStep(sections);
        if (!trimmed) {
          logger.warn("Resume still exceeds one page at minimum content - keeping as is.");
          break;
        }
        sections = trimmed;
        tailored = this.assemble(master, sections);
        pdf = await pdfRenderService.render(tailored);
      }

      const ats = atsCheckService.evaluate({
        markdown: tailored,
        pdf,
        keywords: claimable,
        trueGaps: unclaimable,
        masterExperience: experience,
        tailoredExperience: sections.experience
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

  private assemble(master: string, sections: ResumeSections): string {
    let tailored = markdownService.replace(master, "Skills", sections.skills);
    tailored = markdownService.replace(tailored, "Experience", sections.experience);
    tailored = markdownService.replace(tailored, "Projects", sections.projects);
    return tailored;
  }

  // Hard constraints first (one page, no dropped roles), then the
  // generation-quality coverage as the tiebreaker.
  private isBetter(candidate: AtsReport, current: AtsReport): boolean {
    if (candidate.passed !== current.passed) return candidate.passed;

    const candidateFits = candidate.pages <= 1;
    if (candidateFits !== (current.pages <= 1)) return candidateFits;

    const candidateKeepsEmployers = candidate.missingEmployers.length === 0;
    if (candidateKeepsEmployers !== (current.missingEmployers.length === 0)) {
      return candidateKeepsEmployers;
    }

    return candidate.claimableCoverage > current.claimableCoverage;
  }

  private buildFeedback(ats: AtsReport): string {
    const issues: string[] = [];

    if (ats.missingKeywords.length > 0) {
      issues.push(
        `these target keywords are missing from the resume: ${ats.missingKeywords.join(", ")} - the candidate's master resume contains every one of them, so select the skills/bullets that mention them`
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
