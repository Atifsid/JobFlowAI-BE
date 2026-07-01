import { chromium } from "playwright";
import fs from "fs";
import { Employee, EmployeeProvider } from "../employee.types";
import { env } from "../../../config/env";

// LinkedIn's search-result markup uses hashed/obfuscated class names that
// change across builds, so extraction is structural rather than
// class-based: each result is a [role="listitem"], its profile link is the
// first anchor pointing at /in/<handle>, and the name/title are the first
// two <p> elements in document order (verified against a live session).
const RESULT_CARD_SELECTOR = "[role='listitem']";

class LinkedInProvider implements EmployeeProvider {
  async find(company: string): Promise<Employee[]> {
    if (!fs.existsSync(env.LINKEDIN_SESSION_PATH)) {
      throw new Error(
        `No LinkedIn session found at ${env.LINKEDIN_SESSION_PATH}. Run "npm run linkedin:login" once to log in and save a session.`
      );
    }

    const browser = await chromium.launch({ headless: true });

    try {
      const context = await browser.newContext({
        storageState: env.LINKEDIN_SESSION_PATH
      });
      const page = await context.newPage();

      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company)}`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

      if (/\/(login|checkpoint)/.test(page.url())) {
        throw new Error(
          "LinkedIn session expired or requires verification. Re-run \"npm run linkedin:login\"."
        );
      }

      await page.waitForSelector(RESULT_CARD_SELECTOR, { timeout: 15000 });

      const employees = await page.$$eval(
        RESULT_CARD_SELECTOR,
        (cards, company) =>
          cards
            .map(card => {
              const profileLink = card.querySelector(
                "a[href*='/in/']"
              ) as HTMLAnchorElement | null;
              const paragraphs = Array.from(card.querySelectorAll("p"));
              const name =
                paragraphs[0]
                  ?.querySelector("a")
                  ?.textContent?.replace(/\s+/g, " ")
                  .trim() ?? "";
              const title =
                paragraphs[1]?.textContent?.replace(/\s+/g, " ").trim() ?? "";

              return {
                name,
                title,
                linkedin: profileLink?.getAttribute("href") ?? "",
                company
              };
            })
            .filter(employee => employee.name && employee.linkedin),
        company
      );

      return employees.slice(0, env.EMPLOYEE_SEARCH_LIMIT);
    } finally {
      await browser.close();
    }
  }
}

export default new LinkedInProvider();
