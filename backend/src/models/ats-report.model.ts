// Deterministic post-generation check of a tailored resume: keyword
// coverage against the JD's extracted keywords, PDF page count, and
// whether any role was dropped from the work history.
export interface AtsReport {
  // The real-ATS view: coverage percent (0-100) over ALL of the JD's
  // extracted keywords, including the unclaimable ones - this is what
  // an actual keyword screen would see, and what ranks jobs by fit.
  score: number;
  // Generation quality: coverage over only the CLAIMABLE keywords (ones
  // the master resume contains). This is what the gate passes/fails on -
  // a poor-fit job can't be blamed on the generator.
  claimableCoverage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  // JD keywords the master resume doesn't contain at all - no truthful
  // resume can claim them, so they're reported as fit gaps rather than
  // counted against the generation.
  trueGaps: string[];
  pages: number;
  missingEmployers: string[];
  passed: boolean;
}
