import aiService from "../ai/ai.service";
import logger from "../../config/logger";
import { Employee } from "../../models/employee.model";
import { Job } from "../../models/job.model";

// LinkedIn's connection-note limit. The prompt asks for it, but local
// models miscount characters, so the limit is enforced in code: one
// retry with the overshoot called out, then a word-boundary trim as the
// last resort.
const MAX_LENGTH = 200;

class ReferralService {
  async generate(job: Job, employee: Employee, resumeLink?: string) {
    const first = (await this.draft(job, employee, resumeLink)).trim();
    if (first.length <= MAX_LENGTH) return first;

    logger.warn(
      `Referral draft for ${employee.name} came back ${first.length} chars (limit ${MAX_LENGTH}) - retrying once`
    );

    const second = (
      await this.draft(
        job,
        employee,
        resumeLink,
        `Your previous draft was ${first.length} characters - over the hard ${MAX_LENGTH}-character limit. Rewrite it shorter; count before responding.`
      )
    ).trim();
    if (second.length <= MAX_LENGTH) return second;

    logger.warn(
      `Referral draft for ${employee.name} still ${second.length} chars after retry - trimming at a word boundary`
    );

    return this.trimAtWordBoundary(second);
  }

  private async draft(
    job: Job,
    employee: Employee,
    resumeLink?: string,
    feedback?: string
  ) {
    return aiService.chat([
      {
        role: "system",
        content: `You are writing a short, casual LinkedIn connection request on behalf of a real person - not an AI assistant, and it must not read like one.

Rules:
- Maximum ${MAX_LENGTH} characters total (LinkedIn's connection-note limit) - this is a hard limit, count before responding.
- Write like a real person casually messaging someone, not a template: use contractions, keep it loose and specific, no corporate or formal phrasing.
- Never open with "I hope this message finds you well," "I came across," "I noticed," or any similar stock opener - these read as obviously AI-generated.
- Mention one specific, genuine-sounding thing about the company or role.
- Ask naturally for a referral or a quick chat - don't sound scripted or desperate.
${resumeLink ? "- Include the resume link." : "- No resume link is available - don't mention or invent one."}
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
${resumeLink ? `\nResume:\n${resumeLink}\n` : ""}${feedback ? `\n${feedback}\n` : ""}`
      }
    ]);
  }

  private trimAtWordBoundary(text: string): string {
    const sliced = text.slice(0, MAX_LENGTH);
    const lastSpace = sliced.lastIndexOf(" ");
    return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trim();
  }
}

export default new ReferralService();
