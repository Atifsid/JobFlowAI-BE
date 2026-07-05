// Deterministic post-generation check of a tailored resume: keyword
// coverage against the JD's extracted keywords, PDF page count, and
// whether any role was dropped from the work history.
export interface AtsReport {
  // Coverage percent (0-100) over the CLAIMABLE keywords - the ones the
  // master resume actually contains. Unclaimable ones live in trueGaps.
  score: number;
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
