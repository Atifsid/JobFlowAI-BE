import { google } from "googleapis";

// Separate GoogleAuth instance scoped only to drive.file (not
// spreadsheets) - the minimal Drive scope needed to create/manage files
// this app itself uploads, kept independent from sheets/google.client.ts
// so the existing Sheets integration's scope is untouched.
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials/google-service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"]
});

export default google.drive({
  version: "v3",
  auth
});
