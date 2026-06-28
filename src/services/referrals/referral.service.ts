import aiService from "../ai/ai.service";
import { Employee } from "../../models/employee.model";
import { Job } from "../../models/job.model";

class ReferralService {
  async generate(
    job: Job,
    employee: Employee,
    resumeLink: string
  ) {
    return aiService.chat([
      {
        role: "system",
        content: `You are an expert networking coach.

Generate a concise LinkedIn connection request.

Rules:
- Maximum 300 characters.
- Friendly.
- Mention one thing about the company.
- Ask politely for a referral.
- Include the resume link.
- Never sound desperate.`
      },
      {
        role: "user",
        content: `
Job Title: ${job.title}

Company: ${job.company}

Employee:
${employee.name}
${employee.title}

Resume:
${resumeLink}
`
      }
    ]);
  }
}

export default new ReferralService();