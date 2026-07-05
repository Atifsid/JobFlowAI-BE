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
  keywords: string[];
  // The master resume's Experience section and its tailored replacement,
  // for the no-dropped-employer check.
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

    return {
      score,
      matchedKeywords: matched,
      missingKeywords: missing,
      pages,
      missingEmployers,
      passed:
        score >= COVERAGE_THRESHOLD &&
        pages <= MAX_PAGES &&
        missingEmployers.length === 0
    };
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
  private countPdfPages(pdf: Buffer): number {
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
