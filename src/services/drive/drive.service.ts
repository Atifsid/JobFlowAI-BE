import fs from "fs";
import drive from "./google-drive.client";
import { env } from "../../config/env";

class DriveService {
  /**
   * Uploads a file to Drive and shares it as "anyone with the link can
   * view" - required for the resume-link outreach use case (a referral
   * contact needs to open it without being individually granted access).
   *
   * Authenticates as the user's own Google account (OAuth) rather than
   * the service account - see scripts/google-drive-login.ts for the
   * one-time setup this requires.
   */
  async upload(filePath: string, fileName: string): Promise<string> {
    if (!fs.existsSync(env.GOOGLE_OAUTH_TOKEN_PATH)) {
      throw new Error(
        `No Google Drive OAuth token found at ${env.GOOGLE_OAUTH_TOKEN_PATH}. Run "npm run google:drive-login" once to authorize and save a token.`
      );
    }

    const { data } = await drive.files.create({
      requestBody: {
        name: fileName,
        ...(env.GOOGLE_DRIVE_FOLDER_ID
          ? { parents: [env.GOOGLE_DRIVE_FOLDER_ID] }
          : {})
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
