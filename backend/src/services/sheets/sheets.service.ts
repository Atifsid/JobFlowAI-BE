import sheets from "./google.client";
import { env } from "../../config/env";

class SheetsService {
  private get range() {
    return `${env.GOOGLE_SHEET_NAME}!A:Z`;
  }

  async read() {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: this.range
    });

    return data.values ?? [];
  }

  async append(values: any[]) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: this.range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] }
    });
  }

  async findRow(jobId: string) {
    const rows = await this.read();
    const index = rows.findIndex(row => row[0] === jobId);

    return index === -1 ? null : {
      row: index + 1,
      values: rows[index]
    };
  }

  async update(row: number, values: any[]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: `${env.GOOGLE_SHEET_NAME}!A${row}:Z${row}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] }
    });
  }

  async upsert(jobId: string, values: any[]) {
    const row = await this.findRow(jobId);

    if (row)
      return this.update(row.row, values);

    return this.append(values);
  }

  async exists(jobId: string) {
    return (await this.findRow(jobId)) !== null;
  }
}

export default new SheetsService();