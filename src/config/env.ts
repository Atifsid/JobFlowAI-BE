import dotenv from "dotenv";

dotenv.config();

export const env = {
  // PORT
  PORT: Number(process.env.PORT || 3000),

  // HIREBASE
  HIREBASE_API_KEY: process.env.HIREBASE_API_KEY || "",

  // GOOGLE SHEET
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || "",
  GOOGLE_SHEET_NAME: process.env.GOOGLE_SHEET_NAME || "",
  
  // AI
  AI_PROVIDER: process.env.AI_PROVIDER || "ollama",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
};