import fs from "fs";
import drive from "./google-drive.client";
import { env } from "../../config/env";

class DriveService {
  /**
   * Uploads a file to Drive and shares it as "anyone with the link can
   * view" - required for the resume-link outreach use case (a referral
   * contact needs to open it without being individually granted access).
   *
   * Service accounts have no storage quota of their own, so the file must
   * be created inside a folder a real Google account has shared with the
   * service account (Editor access) - see GOOGLE_DRIVE_FOLDER_ID in
   * .env.example for the one-time setup this requires.
   */
  async upload(filePath: string, fileName: string): Promise<string> {
    if (!env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error(
        "GOOGLE_DRIVE_FOLDER_ID is not set. Service accounts have no Drive storage of their own - create a folder in your Google Drive, share it with the service account's client_email (Editor access), and set GOOGLE_DRIVE_FOLDER_ID to that folder's ID."
      );
    }

    const { data } = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: this.mimeTypeFor(filePath),
        body: fs.createReadStream(filePath)
      },
      fields: "id"
    });

    const fileId = data.id;
    if (!fileId) {
      throw new Error("Drive upload did not return a file id.");
    }

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" }
    });

    const file = await drive.files.get({
      fileId,
      fields: "webViewLink"
    });

    return file.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`;
  }

  private mimeTypeFor(filePath: string): string {
    if (filePath.endsWith(".pdf")) return "application/pdf";
    if (filePath.endsWith(".docx")) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    return "application/octet-stream";
  }
}

export default new DriveService();
