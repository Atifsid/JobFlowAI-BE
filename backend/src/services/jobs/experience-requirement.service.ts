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

  // Whether a job's extracted requirement overlaps the candidate's target
  // range. Missing years-of-experience data is never excluded - plenty of
  // good listings simply don't state it, same precedent jobspedia's own
  // salary filter sets ("never excludes jobs with undisclosed salary").
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
