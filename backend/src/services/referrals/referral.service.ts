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
        content: `You are writing a short, casual LinkedIn connection request on behalf of a real person - not an AI assistant, and it must not read like one.

Rules:
- Maximum 200 characters total (LinkedIn's connection-note limit) - this is a hard limit, count before responding.
- Write like a real person casually messaging someone, not a template: use contractions, keep it loose and specific, no corporate or formal phrasing.
- Never open with "I hope this message finds you well," "I came across," "I noticed," or any similar stock opener - these read as obviously AI-generated.
- Mention one specific, genuine-sounding thing about the company or role.
- Ask naturally for a referral or a quick chat - don't sound scripted or desperate.
- Include the resume link.
- No emojis, no exclamation-point stacking, no generic enthusiasm ("excited," "passionate") - just sound like a normal person.`
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