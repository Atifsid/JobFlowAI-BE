export interface ExperienceRequirement {
  min: number;
  max?: number;
}

// Best-effort, JD-text-based years-of-experience extraction - the
// counterpart to jobspedia's title-only deriveSeniority(), which defaults
// to "mid" for any title without an explicit seniority word and so can't
// tell a 2-year role from an 8-year one. Checked in order, first match
// wins; a JD mentioning multiple year figures (e.g. "3+ years of React
// and 5+ years overall") only ever reports the first, same "best-effort"
// framing jobspedia's own classifier uses.
const RANGE = /(\d+)\s*(?:-|to|–|—)\s*(\d+)\+?\s*(?:years?|yrs?)\b/i;
const MINIMUM = /(?:minimum(?:\s+of)?|at\s+least|min\.?)\s*(\d+)\+?\s*(?:years?|yrs?)\b/i;
const PLUS = /(\d+)\+\s*(?:years?|yrs?)\b/i;
const BARE = /(\d+)\s*(?:years?|yrs?)\b(?:\s+of\s+experience)?/i;

// Fallback estimate used only when the JD text has no years mention at
// all - observed live: every Oracle Recruiting Cloud / JPMC posting in
// this dataset has a one-sentence, teaser-only description (21-141
// chars) that never states years, so "never exclude on missing data"
// let every one of them through regardless of the target range,
// including blatantly senior-track titles ("Principal Software
// Engineer", "Lead Software Engineer"). These ranges are deliberately
// wide (a prior, not a hard cutoff) since title-based seniority is
// itself an approximation - jobspedia's own deriveSeniority() is
// title-only and title inflation is real (a "Senior Software Developer"
// posting elsewhere in this same dataset turned out to want only 3
// years) - but a wide prior beats no signal at all.
const SENIORITY_FALLBACK: Record<string, ExperienceRequirement> = {
  internship: { min: 0, max: 1 },
  entry: { min: 0, max: 2 },
  mid: { min: 1, max: 5 },
  senior: { min: 4, max: 10 },
  lead: { min: 6, max: 15 },
  staff: { min: 8, max: 18 },
  principal: { min: 10 }
};

class ExperienceRequirementService {
  extract(description: string): ExperienceRequirement | null {
    const range = RANGE.exec(description);
    if (range) {
      const min = Number(range[1]);
      const max = Number(range[2]);
      return min <= max ? { min, max } : { min: max, max: min };
    }

    const minimum = MINIMUM.exec(description);
    if (minimum) return { min: Number(minimum[1]) };

    const plus = PLUS.exec(description);
    if (plus) return { min: Number(plus[1]) };

    const bare = BARE.exec(description);
    if (bare) return { min: Number(bare[1]) };

    return null;
  }

  // extract() first (most reliable - the JD's own words), falling back
  // to a seniority-derived estimate only when the JD text says nothing
  // at all. Still returns null (never excludes) when neither signal
  // exists - true missing data, as opposed to a short-but-labeled
  // posting, is left alone.
  resolve(description: string, seniority?: string): ExperienceRequirement | null {
    const extracted = this.extract(description);
    if (extracted) return extracted;
    return seniority ? (SENIORITY_FALLBACK[seniority] ?? null) : null;
  }

  // Whether a job's resolved requirement overlaps the candidate's target
  // range. Only truly missing data (no JD years mention AND no usable
  // seniority label) is never excluded - plenty of good listings simply
  // don't state either, same precedent jobspedia's own salary filter
  // sets ("never excludes jobs with undisclosed salary").
  matches(
    requirement: ExperienceRequirement | null,
    target: { minYears?: number; maxYears?: number }
  ): boolean {
    if (!requirement) return true;
    if (target.maxYears !== undefined && requirement.min > target.maxYears) return false;
    if (
      target.minYears !== undefined &&
      requirement.max !== undefined &&
      requirement.max < target.minYears
    ) {
      return false;
    }
    return true;
  }
}

export default new ExperienceRequirementService();
