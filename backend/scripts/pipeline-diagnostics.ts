import fs from "fs/promises";
import path from "path";
import cache from "../src/services/jobs/job-cache.service";
import resumeService from "../src/services/resume/resume.service";
import markdownService from "../src/services/resume/markdown/markdown.service";
import pdfRenderService from "../src/services/resume/pdf/pdf-render.service";
import resumeAIService from "../src/services/resume/ai/resume-ai.service";
import atsCheckService from "../src/services/resume/ats/ats-check.service";
import resumeFitService, { ResumeSections } from "../src/services/resume/fit/resume-fit.service";
import { AtsReport, InferredSkill } from "../src/models/ats-report.model";

/**
 * Read-only diagnostics harness: runs the exact resume-tailor pipeline
 * (same services, same order, same budgets/retry logic as
 * resume-tailor.service.ts) for a list of job IDs, but captures every
 * intermediate artifact per attempt instead of only the final result.
 * Never calls resume.workflow.ts, so no Drive upload / Sheets write /
 * status advance happens - purely a read/diagnose run.
 *
 * Run from backend/: npx tsx scripts/pipeline-diagnostics.ts <jobId...>
 */

const MAX_ATTEMPTS = 3;
const OUT_DIR = "storage/diagnostics";

interface AttemptRecord {
  attempt: number;
  feedbackGivenToModel: string | null;
  rawSections: ResumeSections;
  budgetedSections: ResumeSections;
  pages: number;
  ats: AtsReport;
}

interface JobDiagnostic {
  jobId: string;
  title: string;
  company: string;
  seniority?: string;
  description: string;
  extractedKeywords: string[];
  claimable: string[];
  trueGaps: string[];
  inferred: InferredSkill[];
  attempts: AttemptRecord[];
  bestAttempt: number;
  finalAts: AtsReport;
}

function isBetter(candidate: AtsReport, current: AtsReport): boolean {
  if (candidate.passed !== current.passed) return candidate.passed;
  const candidateFits = candidate.pages <= 1;
  if (candidateFits !== (current.pages <= 1)) return candidateFits;
  const candidateKeepsEmployers = candidate.missingEmployers.length === 0;
  if (candidateKeepsEmployers !== (current.missingEmployers.length === 0)) {
    return candidateKeepsEmployers;
  }
  return candidate.claimableCoverage > current.claimableCoverage;
}

function buildFeedback(ats: AtsReport): string {
  const issues: string[] = [];
  if (ats.missingKeywords.length > 0) {
    issues.push(
      `these target keywords are missing from the resume: ${ats.missingKeywords.join(", ")} - the candidate's master resume contains every one of them, so select the skills/bullets that mention them`
    );
  }
  if (ats.pages > 1) {
    issues.push(`the resume rendered to ${ats.pages} pages - condense further, it must fit one page`);
  }
  if (ats.missingEmployers.length > 0) {
    issues.push(
      `these roles were dropped from the work history: ${ats.missingEmployers.join("; ")} - every role must be kept with its exact title and company`
    );
  }
  issues.push(
    "while fixing this, stay within every original limit: the section bullet/line budgets and the one-page total are hard constraints"
  );
  return issues.join("; ");
}

function assemble(master: string, sections: ResumeSections): string {
  let tailored = markdownService.replace(master, "Skills", sections.skills);
  tailored = markdownService.replace(tailored, "Experience", sections.experience);
  tailored = markdownService.replace(tailored, "Projects", sections.projects);
  return tailored;
}

async function diagnoseJob(jobId: string): Promise<void> {
  const job = await cache.get(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found in cache - skipping.`);
    return;
  }

  console.log(`\n=== ${job.title} @ ${job.company} (${jobId}) ===`);

  const master = await resumeService.getMasterResume();
  const skills = markdownService.extract(master, "Skills");
  const experience = markdownService.extract(master, "Experience");
  const projects = markdownService.extract(master, "Projects");

  const extractedKeywords = await resumeAIService.extractKeywords(job.description);
  console.log("Extracted keywords:", extractedKeywords.join(", "));

  const { claimable, unclaimable, inferred } = atsCheckService.partitionClaimable(master, extractedKeywords);
  console.log("Claimable:", claimable.join(", "));
  console.log("True gaps (missing from master resume):", unclaimable.join(", ") || "(none)");
  console.log(
    "Inferred (implied by a claimed skill):",
    inferred.map(i => `${i.skill} (via ${i.parent})`).join(", ") || "(none)"
  );

  const attempts: AttemptRecord[] = [];
  let best: { pdf: Buffer; ats: AtsReport; sections: ResumeSections } | undefined;
  let feedback: string | undefined;

  const jobDir = path.join(OUT_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const rawSections: ResumeSections = {
      skills: await resumeAIService.tailorSkills(skills, claimable, feedback),
      experience: await resumeAIService.tailorExperience(experience, claimable, feedback),
      projects: await resumeAIService.tailorProjects(projects, claimable, feedback)
    };

    let sections = resumeFitService.enforceBudgets(rawSections);
    let tailored = assemble(master, sections);
    let pdf = await pdfRenderService.render(tailored);

    let pages = atsCheckService.countPdfPages(pdf);
    while (pages > 1) {
      const trimmed = resumeFitService.trimOneStep(sections);
      if (!trimmed) break;
      sections = trimmed;
      tailored = assemble(master, sections);
      pdf = await pdfRenderService.render(tailored);
      pages = atsCheckService.countPdfPages(pdf);
    }

    while (pages <= 1) {
      const grown = resumeFitService.growOneStep(sections, { skills, experience, projects });
      if (!grown) break;
      const candidateTailored = assemble(master, grown);
      const candidatePdf = await pdfRenderService.render(candidateTailored);
      const candidatePages = atsCheckService.countPdfPages(candidatePdf);
      if (candidatePages > 1) break;
      sections = grown;
      tailored = candidateTailored;
      pdf = candidatePdf;
      pages = candidatePages;
    }

    const ats = atsCheckService.evaluate({
      markdown: tailored,
      pdf,
      keywords: claimable,
      trueGaps: unclaimable,
      inferredSkills: inferred,
      masterExperience: experience,
      tailoredExperience: sections.experience
    });

    attempts.push({
      attempt,
      feedbackGivenToModel: feedback ?? null,
      rawSections,
      budgetedSections: sections,
      pages,
      ats
    });

    console.log(
      `  attempt ${attempt}: claimableCoverage=${ats.claimableCoverage}% score=${ats.score}% pages=${ats.pages} passed=${ats.passed}` +
        (ats.missingEmployers.length ? ` missingEmployers=${ats.missingEmployers.join("; ")}` : "")
    );

    if (!best || isBetter(ats, best.ats)) {
      best = { pdf, ats, sections };
    }

    await fs.writeFile(path.join(jobDir, `attempt-${attempt}.md`), tailored);

    if (ats.passed) break;
    feedback = buildFeedback(ats);
  }

  const finalAts = (best as { pdf: Buffer; ats: AtsReport; sections: ResumeSections }).ats;
  await fs.writeFile(path.join(jobDir, "resume.pdf"), (best as { pdf: Buffer }).pdf);

  const diagnostic: JobDiagnostic = {
    jobId,
    title: job.title,
    company: job.company,
    seniority: job.seniority,
    description: job.description,
    extractedKeywords,
    claimable,
    trueGaps: unclaimable,
    inferred,
    attempts,
    bestAttempt: attempts.findIndex(a => a.ats === finalAts) + 1,
    finalAts
  };

  await fs.writeFile(path.join(jobDir, "result.json"), JSON.stringify(diagnostic, null, 2));
  console.log(`Wrote diagnostics to ${jobDir}/`);
}

async function main() {
  const jobIds = process.argv.slice(2);
  if (jobIds.length === 0) {
    console.error("Usage: npx tsx scripts/pipeline-diagnostics.ts <jobId...>");
    process.exit(1);
  }

  for (const jobId of jobIds) {
    await diagnoseJob(jobId);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
