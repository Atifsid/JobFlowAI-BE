import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials/google-service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

export default google.sheets({
  version: "v4",
  auth
});