import fs from "fs";
import { google } from "googleapis";
import { env } from "../../config/env";

// Uploads authenticate as the user's own Google account (OAuth), not the
// service account used for Sheets - service accounts have no Drive
// storage quota of their own, and Google no longer honors folder-sharing
// as a workaround (confirmed live; only Shared Drives / domain-wide
// delegation work now, both Workspace-only). See
// scripts/google-drive-login.ts for the one-time consent flow that
// produces the token file this reads.
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_OAUTH_CLIENT_ID,
  env.GOOGLE_OAUTH_CLIENT_SECRET
);

if (fs.existsSync(env.GOOGLE_OAUTH_TOKEN_PATH)) {
  const tokens = JSON.parse(fs.readFileSync(env.GOOGLE_OAUTH_TOKEN_PATH, "utf8"));
  oauth2Client.setCredentials(tokens);

  oauth2Client.on("tokens", updated => {
    const merged = { ...tokens, ...updated };
    fs.writeFileSync(
      env.GOOGLE_OAUTH_TOKEN_PATH,
      JSON.stringify(merged, null, 2)
    );
  });
}

export default google.drive({
  version: "v3",
  auth: oauth2Client
});
