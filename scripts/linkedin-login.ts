import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { env } from "../src/config/env";

/**
 * One-time interactive setup: opens a real (headed) browser, lets you log
 * into LinkedIn by hand (including any 2FA/checkpoint), then saves the
 * authenticated session so linkedin.provider.ts can reuse it without ever
 * automating the login form itself.
 *
 * Run with: npm run linkedin:login
 */
async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://www.linkedin.com/login");

  console.log("A browser window has opened.");
  console.log(
    "Log into LinkedIn there, including any 2FA/checkpoint step, until you land on your feed."
  );
  console.log("Then come back here and press Enter to save the session.");

  await new Promise<void>(resolve => {
    process.stdin.once("data", () => resolve());
  });

  fs.mkdirSync(path.dirname(env.LINKEDIN_SESSION_PATH), { recursive: true });
  await context.storageState({ path: env.LINKEDIN_SESSION_PATH });

  console.log(`Session saved to ${env.LINKEDIN_SESSION_PATH}`);

  await browser.close();
  process.exit(0);
}

main();
