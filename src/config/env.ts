import dotenv from "dotenv";

dotenv.config();

export const env = {
  // PORT
  PORT: Number(process.env.PORT || 3000),

  // HIREBASE
  HIREBASE_API_KEY: process.env.HIREBASE_API_KEY || "",
  HIREBASE_USE_LIVE_API: process.env.HIREBASE_USE_LIVE_API === "true",

  // GREENHOUSE
  GREENHOUSE_BOARD_TOKENS: process.env.GREENHOUSE_BOARD_TOKENS || "",

  // GOOGLE SHEET
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || "",
  GOOGLE_SHEET_NAME: process.env.GOOGLE_SHEET_NAME || "",
  
  // AI
  AI_PROVIDER: process.env.AI_PROVIDER || "claude",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",

  // LINKEDIN
  LINKEDIN_SESSION_PATH:
    process.env.LINKEDIN_SESSION_PATH || "credentials/linkedin-session.json",
  EMPLOYEE_SEARCH_LIMIT: Number(process.env.EMPLOYEE_SEARCH_LIMIT || 5),

  // RESUME PDF + DRIVE
  RESUME_PDF_ENABLED: process.env.RESUME_PDF_ENABLED === "true",
  DRIVE_UPLOAD_ENABLED: process.env.DRIVE_UPLOAD_ENABLED === "true",
  // Optional - if set, uploads go into this folder; otherwise Drive root.
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || "",
  // Service accounts have no Drive storage quota of their own (confirmed
  // live - sharing a folder with the service account does not work either,
  // Google now requires Shared Drives or domain-wide delegation for that,
  // both Workspace-only). Drive uploads instead authenticate as the user's
  // own Google account via OAuth, so the file lands in their own quota.
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
  GOOGLE_OAUTH_TOKEN_PATH:
    process.env.GOOGLE_OAUTH_TOKEN_PATH ||
    "credentials/google-oauth-token.json",
};