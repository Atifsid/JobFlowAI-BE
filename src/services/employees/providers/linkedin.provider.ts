import { chromium } from "playwright";
import fs from "fs";
import { Employee, EmployeeProvider } from "../employee.types";
import { env } from "../../../config/env";

const RESULT_CARD_SELECTOR = "li.reusable-search__result-container";
const NAME_SELECTOR = ".entity-result__title-text a span[aria-hidden='true']";
const TITLE_SELECTOR = ".entity-result__primary-subtitle";
const LINK_SELECTOR = ".entity-result__title-text a";

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
        (cards, args) =>
          cards
            .map(card => ({
              name:
                card
                  .querySelector(args.nameSelector)
                  ?.textContent?.trim() ?? "",
              title:
                card
                  .querySelector(args.titleSelector)
                  ?.textContent?.trim() ?? "",
              linkedin:
                (card.querySelector(args.linkSelector) as HTMLAnchorElement)
                  ?.href ?? "",
              company: args.company
            }))
            .filter(employee => employee.name && employee.linkedin),
        {
          nameSelector: NAME_SELECTOR,
          titleSelector: TITLE_SELECTOR,
          linkSelector: LINK_SELECTOR,
          company
        }
      );

      return employees.slice(0, env.EMPLOYEE_SEARCH_LIMIT);
    } finally {
      await browser.close();
    }
  }
}

export default new LinkedInProvider();
