import http from "http";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { env } from "../src/config/env";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;

/**
 * One-time interactive setup: since service accounts can't create files
 * in a personal Google account's Drive (no storage quota, and Google no
 * longer honors folder-sharing as a workaround), Drive uploads instead
 * authenticate as the user via OAuth. This opens a browser for consent,
 * captures the redirect via a local loopback server, and saves the
 * resulting token so drive.service.ts can reuse it.
 *
 * Requires a "Desktop app" OAuth Client ID from Google Cloud Console
 * (APIs & Services > Credentials) with the Drive API enabled on the
 * project, set as GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.
 *
 * Run with: npm run google:drive-login
 */
async function main() {
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    console.error(
      "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not set. Create a Desktop app OAuth Client ID in Google Cloud Console first."
    );
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"]
  });

  console.log("Open this URL in your browser and sign in:");
  console.log(authUrl);

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", REDIRECT_URI);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.end("Authorization failed. You can close this tab.");
        server.close();
        reject(new Error(error));
        return;
      }

      if (code) {
        res.end(
          "Authorization complete. You can close this tab and return to the terminal."
        );
        server.close();
        resolve(code);
      }
    });

    server.listen(PORT);
  });

  const { tokens } = await oauth2Client.getToken(code);

  fs.mkdirSync(path.dirname(env.GOOGLE_OAUTH_TOKEN_PATH), {
    recursive: true
  });
  fs.writeFileSync(env.GOOGLE_OAUTH_TOKEN_PATH, JSON.stringify(tokens, null, 2));

  console.log(`Token saved to ${env.GOOGLE_OAUTH_TOKEN_PATH}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
