import { Job } from "../../models/job.model";
import { ResumeScore } from "../../models/resume-score.model";

// Union of the skills previously split across the SDE/React/React Native
// resume templates. There is now a single master resume, so there is a
// single skill list to score jobs against.
const MASTER_SKILLS = [
  "Java",
  "C#",
  ".NET",
  "TypeScript",
  "SQL",
  "Node.js",
  "JavaScript",
  "React",
  "Angular",
  "Next.js",
  "Redux",
  "React Native",
  "Android",
  "iOS",
  "Kotlin",
  "Swift"
];

class JobMatcherService {
  match(job: Job): ResumeScore {
    const jobSkills = job.skills ?? [];
    const matched = jobSkills.filter(skill =>
      MASTER_SKILLS.some(s => s.toLowerCase() === skill.toLowerCase())
    );

    const missing = jobSkills.filter(
      skill => !MASTER_SKILLS.some(s => s.toLowerCase() === skill.toLowerCase())
    );

    const score = jobSkills.length
      ? Math.round((matched.length / jobSkills.length) * 100)
      : 0;

    return {
      score,
      missingSkills: missing,
      strengths: matched.map(s => `Matched: ${s}`),
      weaknesses: missing.map(s => `Missing: ${s}`),
      recommendation:
        score >= 70 ? "Apply" : score >= 50 ? "Maybe" : "Skip"
    };
  }
}

export default new JobMatcherService();
