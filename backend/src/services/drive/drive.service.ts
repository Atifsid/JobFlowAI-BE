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
    // Fail with actionable configuration errors instead of letting
    // Google's raw OAuth strings ("invalid_request") reach the UI.
    if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
      throw new Error(
        "Google Drive upload is enabled (DRIVE_UPLOAD_ENABLED=true) but GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not set in backend/.env - set them (or disable Drive upload)."
      );
    }
    if (!fs.existsSync(env.GOOGLE_OAUTH_TOKEN_PATH)) {
      throw new Error(
        `No Google Drive OAuth token found at ${env.GOOGLE_OAUTH_TOKEN_PATH}. Run "npm run google:drive-login" once to authorize and save a token.`
      );
    }

    try {
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
    } catch (err: any) {
      const detail = err?.errors?.[0]?.message ?? err?.message ?? "unknown error";
      throw new Error(
        `Google Drive upload failed: ${detail}. Check the GOOGLE_OAUTH_* values in backend/.env and re-run "npm run google:drive-login" if the token is stale.`,
        { cause: err }
      );
    }
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
