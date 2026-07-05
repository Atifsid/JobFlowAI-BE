import aiService from "../../ai/ai.service";
import logger from "../../../config/logger";

const OVERFLOW_MARKER = "OVERFLOW WARNING:";
const MAX_KEYWORDS = 20;

// The extraction prompt explicitly forbids responsibilities/activity
// phrases, but local models emit them anyway - observed live: "Code
// Review", "Web Development", "Web Performance Optimization" all leaked
// through and became "true gaps" no resume could ever claim, since
// they're not real skills to begin with. This is a deterministic
// backstop matching the recurring SHAPE of the violation, not a full
// classifier - it won't catch everything, but it catches what's actually
// been observed to recur.
const ACTIVITY_PHRASE_PATTERNS = [
  /\b(code|design|peer|sprint)\s+review\b/i,
  /\b(web|mobile app|full[- ]stack|backend|frontend|software)\s+(development|engineering)\b/i,
  /\bperformance\s+optimi[sz]ation\b/i,
  /\bcross[- ]platform\s+compatibility\b/i,
  /\bquantitative\s+analysis\b/i,
  /\b(research|analysis|research and)\s+tools?\b/i,
  /\bdata\s+platforms?\b/i,
  /\bscalable\s+apps?\b/i,
  /\btravel\s+planning\b/i,
  /\bknowledge\s+sharing\b/i
];

function isActivityPhrase(keyword: string): boolean {
  return ACTIVITY_PHRASE_PATTERNS.some(pattern => pattern.test(keyword));
}

class ResumeAIService {
  // Asks the model for the JD's target keywords as a JSON array. Local
  // models don't always return clean JSON, so parsing is defensive
  // (fences/prose tolerated) with one retry before giving up - the
  // keywords feed both the tailoring prompts and the ATS gate, so
  // generation can't proceed without them.
  async extractKeywords(jobDescription: string): Promise<string[]> {
    const first = this.parseKeywords(await aiService.extractKeywords(jobDescription));
    if (first) return first;

    logger.warn("Keyword extraction returned unparseable output, retrying once");

    const second = this.parseKeywords(await aiService.extractKeywords(jobDescription));
    if (second) return second;

    throw new Error(
      "Keyword extraction failed: the model did not return a JSON array of keywords"
    );
  }

  async tailorSkills(skills: string, keywords: string[], feedback?: string) {
    return this.clean(await aiService.tailorSkills(skills, keywords, feedback), "Skills");
  }

  async tailorExperience(experience: string, keywords: string[], feedback?: string) {
    return this.clean(await aiService.tailorExperience(experience, keywords, feedback), "Experience");
  }

  async tailorProjects(projects: string, keywords: string[], feedback?: string) {
    return this.clean(await aiService.tailorProjects(projects, keywords, feedback), "Projects");
  }

  private clean(raw: string, section: string): string {
    return this.ensureContent(
      this.stripSectionLabel(this.stripOverflowWarning(raw), section),
      section
    );
  }

  // Tolerates markdown fences and surrounding prose: grabs the first
  // [...] span and JSON-parses just that. Returns null when there's no
  // usable string array inside.
  private parseKeywords(text: string): string[] | null {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end <= start) return null;

    try {
      const parsed: unknown = JSON.parse(text.slice(start, end + 1));
      if (!Array.isArray(parsed)) return null;

      const keywords = [
        ...new Set(
          parsed
            .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
            // JDs write compounds like "JavaScript (React)" - as one
            // keyword that literal string never appears in a resume, so
            // coverage can't ever count it. Split into both parts.
            .flatMap(k => k.split(/[()]/))
            .map(k => k.trim().replace(/[,.]$/, ""))
            .filter(k => k.length > 0)
            .filter(k => !isActivityPhrase(k))
        )
      ];

      return keywords.length > 0 ? keywords.slice(0, MAX_KEYWORDS) : null;
    } catch {
      return null;
    }
  }

  // The tailoring prompts ask the model to flag likely one-page overflow
  // with an "OVERFLOW WARNING: ..." note. Left in, that text would
  // render as visible resume content - strip it and log it instead.
  // Models put the marker anywhere (observed live LEADING the section,
  // which under end-of-text stripping deleted the whole section), so
  // only the marker's own line is removed; content on both sides stays.
  private stripOverflowWarning(text: string): string {
    const index = text.indexOf(OVERFLOW_MARKER);
    if (index === -1) return text.trim();

    const lineEnd = text.indexOf("\n", index);
    const warningLine = lineEnd === -1 ? text.slice(index) : text.slice(index, lineEnd);
    logger.warn(warningLine.trim());

    const rest = text.slice(0, index) + (lineEnd === -1 ? "" : text.slice(lineEnd + 1));
    return rest.trim();
  }

  // Models sometimes open with the section's own name as a label
  // ("Projects:") despite "return only the section text" - rendered,
  // that duplicates the section heading. Strip it deterministically.
  private stripSectionLabel(text: string, section: string): string {
    return text.replace(new RegExp(`^(?:\\*\\*)?${section}(?:\\*\\*)?:?\\s*\\n`, "i"), "").trim();
  }

  // Observed live: a local model once returned ONLY the overflow marker,
  // which after stripping would silently render a resume with an empty
  // section. Fail loudly instead - the pipeline reports the error and a
  // re-run fixes it.
  private ensureContent(text: string, section: string): string {
    if (!text) {
      throw new Error(
        `Tailored ${section} section came back empty - the model returned no usable content. Re-run the pipeline for this job.`
      );
    }
    return text;
  }
}

export default new ResumeAIService();
