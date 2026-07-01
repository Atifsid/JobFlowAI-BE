import aiService from "../../ai/ai.service";

class ResumeAIService {
  async tailorSkills(skills: string, jobDescription: string) {
    return aiService.tailorSkills(skills, jobDescription);
  }

  async tailorExperience(experience: string, jobDescription: string) {
    return aiService.tailorExperience(experience, jobDescription);
  }

  async tailorProjects(projects: string, jobDescription: string) {
    return aiService.tailorProjects(projects, jobDescription);
  }
}

export default new ResumeAIService();
