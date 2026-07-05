import { AtsReport } from "../../../models/ats-report.model";

// The pass bar for a generated resume: enough JD keywords present, one
// page, and no employer silently dropped from the work history. All
// checks are deterministic - the model writes prose, code verifies it.
const COVERAGE_THRESHOLD = 75;
const MAX_PAGES = 1;

interface AtsCheckInput {
  // The full tailored resume markdown (all sections substituted in).
  markdown: string;
  pdf: Buffer;
  // The CLAIMABLE keywords (present in the master resume) - see
  // partitionClaimable.
  keywords: string[];
  // JD keywords the master resume doesn't contain - passed through to
  // the report as fit gaps, never counted against the generation.
  trueGaps: string[];
  // The master resume's Experience section and its tailored replacement,
  // for the no-dropped-role check.
  masterExperience: string;
  tailoredExperience: string;
}

class AtsCheckService {
  evaluate(input: AtsCheckInput): AtsReport {
    const { matched, missing } = this.matchKeywords(input.markdown, input.keywords);
    const score = input.keywords.length
      ? Math.round((matched.length / input.keywords.length) * 100)
      : 0;
    const pages = this.countPdfPages(input.pdf);
    const missingEmployers = this.findMissingEmployers(
      input.masterExperience,
      input.tailoredExperience
    );

    // With no claimable keywords at all there's nothing for coverage to
    // measure - the job is simply a poor fit (all keywords in trueGaps);
    // don't fail the generation for it.
    const coverageOk =
      input.keywords.length === 0 || score >= COVERAGE_THRESHOLD;

    return {
      score,
      matchedKeywords: matched,
      missingKeywords: missing,
      trueGaps: input.trueGaps,
      pages,
      missingEmployers,
      passed: coverageOk && pages <= MAX_PAGES && missingEmployers.length === 0
    };
  }

  // Splits the JD's keywords into what the master resume actually
  // contains (claimable - the tailoring prompts and the coverage gate
  // work on these) and what it doesn't (true gaps - no honest resume can
  // add them, so demanding them just makes the model fabricate).
  partitionClaimable(masterResume: string, keywords: string[]) {
    const { matched, missing } = this.matchKeywords(masterResume, keywords);
    return { claimable: matched, unclaimable: missing };
  }

  // Case-insensitive whole-term match: "Java" must not count because
  // "JavaScript" appears. Keywords can contain non-word characters
  // ("CI/CD", "Node.js"), so boundaries are checked manually instead of
  // relying on \b.
  private matchKeywords(text: string, keywords: string[]) {
    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of keywords) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`,
        "i"
      );
      (pattern.test(text) ? matched : missing).push(keyword);
    }

    return { matched, missing };
  }

  // Chromium (Skia) writes page dictionaries uncompressed, so counting
  // "/Type /Page" objects works directly; the page-tree "/Count N"
  // maximum is the fallback. Verified against real Playwright output
  // (1-page and 65-page documents).
  countPdfPages(pdf: Buffer): number {
    const text = pdf.toString("latin1");

    const pageObjects = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    if (pageObjects > 0) return pageObjects;

    const counts = [...text.matchAll(/\/Count\s+(\d+)/g)].map(m => Number(m[1]));
    return counts.length ? Math.max(...counts) : 0;
  }

  // The tailoring prompt requires every role to be kept (no gaps in the
  // work-history timeline), but smaller local models don't always
  // comply - observed live with a 7B model silently dropping a role.
  // Checking company names alone isn't enough: with two roles at the
  // same company, one can vanish while the company name still appears
  // (also observed live). So each "**Title** | Company | Dates" pair
  // from the master must survive as a pair.
  findMissingEmployers(masterExperience: string, tailoredExperience: string): string[] {
    const roles = [
      ...masterExperience.matchAll(/\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|/g)
    ].map(match => ({ title: match[1].trim(), company: match[2].trim() }));

    const tailoredLines = tailoredExperience.split("\n");

    return roles
      .filter(
        role =>
          !tailoredLines.some(
            line => line.includes(role.title) && line.includes(role.company)
          )
      )
      .map(role => `${role.title} | ${role.company}`);
  }
}

export default new AtsCheckService();
