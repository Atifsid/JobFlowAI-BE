import { chromium, Page } from "playwright";
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

      const companyId = await this.resolveCompanyId(page, company);

      // Filtering by LinkedIn's "Current company" facet (when we can
      // resolve a company ID) is far more precise than a plain keyword
      // search, which also matches profiles that merely *mention* the
      // company (certifications, tools used, etc.) rather than working
      // there. Fall back to keyword search if resolution fails.
      const searchUrl = companyId
        ? `https://www.linkedin.com/search/results/people/?currentCompany=${encodeURIComponent(JSON.stringify([companyId]))}`
        : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company)}`;

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

  /**
   * Resolves a company name to LinkedIn's internal numeric company ID by
   * searching LinkedIn's company search, following the top result to its
   * company page, and pulling the ID out of the embedded page data.
   * Returns null (rather than throwing) on any failure so the caller can
   * fall back to a plain keyword search.
   */
  private async resolveCompanyId(
    page: Page,
    company: string
  ): Promise<string | null> {
    try {
      const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`;
      await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

      const companyHref = await page.$eval(
        "a[href*='/company/']",
        anchor => anchor.getAttribute("href")
      );

      const universalName = companyHref?.match(/\/company\/([^/?]+)/)?.[1];
      if (!universalName) return null;

      await page.goto(`https://www.linkedin.com/company/${universalName}/`, {
        waitUntil: "domcontentloaded"
      });

      const html = await page.content();
      const idMatch = html.match(
        new RegExp(
          `"entityUrn":"urn:li:fsd_company:(\\d+)"[\\s\\S]{0,500}?"universalName":"${universalName}"`
        )
      );

      return idMatch?.[1] ?? null;
    } catch {
      return null;
    }
  }
}

export default new LinkedInProvider();
