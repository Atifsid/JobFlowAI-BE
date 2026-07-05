// Small hardcoded equivalence table: skills the matcher should treat as the
// same thing regardless of which spelling the JD or resume happens to use.
// Whole-term matching alone is intentionally strict ("Java" must not match
// inside "JavaScript"), but that same strictness makes "React.js" and
// "React", or "Postgres" and "PostgreSQL", read as unrelated skills - a
// real gap in the resume - when they're actually the same thing spelled
// differently. Observed live: both cases flagged a skill the candidate
// already has as a "true gap" purely because of wording.
const ALIAS_GROUPS: string[][] = [
  ["React", "React.js", "ReactJS"],
  ["Next.js", "NextJS", "Next"],
  ["Node.js", "NodeJS", "Node"],
  ["Vue", "Vue.js", "VueJS"],
  ["TypeScript", "TS"],
  ["JavaScript", "JS"],
  ["PostgreSQL", "Postgres"],
  ["MongoDB", "Mongo"],
  ["Kubernetes", "K8s"],
  ["Golang", "Go"],
  ["AWS", "Amazon Web Services"],
  ["GCP", "Google Cloud Platform", "Google Cloud"],
  ["REST", "REST API", "RESTful", "RESTful API", "REST APIs"],
  ["CI/CD", "CI-CD"],
  ["HTML", "HTML5"],
  ["CSS", "CSS3"]
];

const groupFor = new Map<string, string[]>();
for (const group of ALIAS_GROUPS) {
  for (const term of group) {
    groupFor.set(term.toLowerCase(), group);
  }
}

// Every spelling this term is known to be equivalent to, itself included -
// callers test all of them and, on a hit, keep using the caller's original
// term (not the alias that matched) so output stays in whichever wording
// the JD actually used.
export function aliasesOf(term: string): string[] {
  return groupFor.get(term.toLowerCase()) ?? [term];
}

// Whether two terms are known to name the same skill, regardless of which
// spelling either side uses.
export function sameSkill(a: string, b: string): boolean {
  const aliasesOfA = new Set(aliasesOf(a).map(s => s.toLowerCase()));
  return aliasesOf(b).some(s => aliasesOfA.has(s.toLowerCase()));
}
