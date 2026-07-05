import sheets from "./google.client";
import { env } from "../../config/env";
import { Employee } from "../../models/employee.model";
import { Job } from "../../models/job.model";

const FOLLOW_UP_DAYS = 7;

// Tracks the people referral notes were actually sent to, on a second
// tab of the tracker spreadsheet. Rows are written only when the user
// clicks "Mark as sent" - never automatically - so writes stay far under
// the Sheets API quota. Row shape:
// [jobId, company, jobTitle, name, title, linkedin, resumeLink, sentAt, status, followUpAt]
class ContactsService {
  private get range() {
    return `${env.GOOGLE_CONTACTS_SHEET_NAME}!A:Z`;
  }

  async markSent(job: Job, employee: Employee, resumeLink?: string) {
    const sentAt = new Date();
    const followUpAt = new Date(sentAt);
    followUpAt.setDate(followUpAt.getDate() + FOLLOW_UP_DAYS);

    const values = [
      job.id,
      job.company,
      job.title,
      employee.name,
      employee.title,
      employee.linkedin,
      resumeLink ?? "",
      sentAt.toISOString(),
      "INVITED",
      followUpAt.toISOString().slice(0, 10)
    ];

    // Same person marked sent twice for the same job updates the
    // existing row instead of duplicating it.
    const existing = await this.findRow(job.id, employee.linkedin);

    if (existing) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        range: `${env.GOOGLE_CONTACTS_SHEET_NAME}!A${existing}:Z${existing}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [values] }
      });
      return;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: this.range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] }
    });
  }

  private async findRow(jobId: string, linkedin: string): Promise<number | null> {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: this.range
    });

    const rows = data.values ?? [];
    const index = rows.findIndex(row => row[0] === jobId && row[5] === linkedin);

    return index === -1 ? null : index + 1;
  }
}

export default new ContactsService();
