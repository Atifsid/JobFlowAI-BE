class ResumeAIService {
  async tailorSkills(
    skills: string,
    jobDescription: string
  ) {
    return skills;
  }

  async tailorExperience(
    experience: string,
    jobDescription: string
  ) {
    return experience;
  }

  async tailorProjects(
    projects: string,
    jobDescription: string
  ) {
    return projects;
  }
}

export default new ResumeAIService();