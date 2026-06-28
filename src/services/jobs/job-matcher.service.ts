import { Job } from "../../models/job.model";
import { ResumeTemplate } from "../../models/resume-template.model";
import { ResumeScore } from "../../models/resume-score.model";

class JobMatcherService {
  match(job: Job, template: ResumeTemplate): ResumeScore {
    const resumeSkills = this.getSkills(template);

    const jobSkills = job.skills ?? [];
    const matched = jobSkills.filter(skill =>
      resumeSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    );

    const missing = jobSkills.filter(skill =>
      !resumeSkills.some(s => s.toLowerCase() === skill.toLowerCase())
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
        score >= 70
          ? "Apply"
          : score >= 50
            ? "Maybe"
            : "Skip"
    };
  }

  private getSkills(template: ResumeTemplate): string[] {
    switch (template) {
      case ResumeTemplate.REACT_NATIVE:
        return [
          "React Native",
          "TypeScript",
          "JavaScript",
          "Android",
          "iOS",
          "Kotlin",
          "Swift"
        ];

      case ResumeTemplate.REACT:
        return [
          "React",
          "Next.js",
          "TypeScript",
          "JavaScript",
          "Redux"
        ];

      default:
        return [
          "Java",
          "C#",
          ".NET",
          "TypeScript",
          "SQL",
          "Node.js",
          "JavaScript",
          "React",
          "Angular"
        ];
    }
  }
}

export default new JobMatcherService();