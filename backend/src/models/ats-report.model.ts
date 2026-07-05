// Deterministic post-generation check of a tailored resume: keyword
// coverage against the JD's extracted keywords, PDF page count, and
// whether any employer was dropped from the work history.
export interface AtsReport {
  // Keyword coverage percent, 0-100.
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  pages: number;
  missingEmployers: string[];
  passed: boolean;
}
