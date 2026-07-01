import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockLaunch, mockExistsSync } = vi.hoisted(() => ({
  mockLaunch: vi.fn(),
  mockExistsSync: vi.fn()
}));

vi.mock("playwright", () => ({
  chromium: { launch: mockLaunch }
}));

vi.mock("fs", () => ({
  default: { existsSync: mockExistsSync },
  existsSync: mockExistsSync
}));

import linkedinProvider from "../../../../src/services/employees/providers/linkedin.provider";

const SEARCH_URL = "https://www.linkedin.com/search/results/people/?keywords=Acme";

const buildBrowser = (page: Record<string, unknown>) => {
  const context = { newPage: vi.fn().mockResolvedValue(page) };
  return {
    newContext: vi.fn().mockResolvedValue(context),
    close: vi.fn().mockResolvedValue(undefined)
  };
};

const buildPage = (overrides: Record<string, unknown> = {}) => ({
  goto: vi.fn().mockResolvedValue(undefined),
  url: vi.fn().mockReturnValue(SEARCH_URL),
  waitForSelector: vi.fn().mockResolvedValue(undefined),
  $$eval: vi.fn().mockResolvedValue([
    {
      name: "Jane Doe",
      title: "Engineer",
      linkedin: "https://linkedin.com/in/janedoe",
      company: "Acme"
    }
  ]),
  ...overrides
});

describe("LinkedInProvider.find", () => {
  beforeEach(() => {
    mockLaunch.mockReset();
    mockExistsSync.mockReset();
  });

  it("throws without launching a browser when no session file exists", async () => {
    mockExistsSync.mockReturnValue(false);

    await expect(linkedinProvider.find("Acme")).rejects.toThrow(
      /npm run linkedin:login/
    );
    expect(mockLaunch).not.toHaveBeenCalled();
  });

  it("returns employees scraped from the search results page", async () => {
    mockExistsSync.mockReturnValue(true);
    const page = buildPage();
    const browser = buildBrowser(page);
    mockLaunch.mockResolvedValue(browser);

    const result = await linkedinProvider.find("Acme");

    expect(page.goto).toHaveBeenCalledWith(
      expect.stringContaining("keywords=Acme"),
      expect.any(Object)
    );
    expect(result).toEqual([
      {
        name: "Jane Doe",
        title: "Engineer",
        linkedin: "https://linkedin.com/in/janedoe",
        company: "Acme"
      }
    ]);
    expect(browser.close).toHaveBeenCalled();
  });

  it("throws and still closes the browser when the session has expired", async () => {
    mockExistsSync.mockReturnValue(true);
    const page = buildPage({
      url: vi.fn().mockReturnValue("https://www.linkedin.com/checkpoint/challenge")
    });
    const browser = buildBrowser(page);
    mockLaunch.mockResolvedValue(browser);

    await expect(linkedinProvider.find("Acme")).rejects.toThrow(
      /linkedin:login/
    );
    expect(browser.close).toHaveBeenCalled();
  });

  it("caps results at the configured employee search limit", async () => {
    mockExistsSync.mockReturnValue(true);
    const sevenResults = Array.from({ length: 7 }, (_, i) => ({
      name: `Person ${i}`,
      title: "Engineer",
      linkedin: `https://linkedin.com/in/person${i}`,
      company: "Acme"
    }));
    const page = buildPage({ $$eval: vi.fn().mockResolvedValue(sevenResults) });
    const browser = buildBrowser(page);
    mockLaunch.mockResolvedValue(browser);

    const result = await linkedinProvider.find("Acme");

    expect(result).toHaveLength(5);
  });
});
