import { ResumeTemplate } from "../../../models/resume-template.model";

class ResumeSelectorService {
  select(jobDescription: string): ResumeTemplate {
    const jd = jobDescription.toLowerCase();

    if (
      jd.includes("react native") ||
      jd.includes("expo") ||
      jd.includes("android") ||
      jd.includes("ios")
    ) {
      return ResumeTemplate.REACT_NATIVE;
    }

    if (
      jd.includes("react") ||
      jd.includes("next.js") ||
      jd.includes("nextjs") ||
      jd.includes("frontend")
    ) {
      return ResumeTemplate.REACT;
    }

    return ResumeTemplate.SDE;
  }
}

export default new ResumeSelectorService();