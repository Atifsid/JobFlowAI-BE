import { chromium } from "playwright";
import { marked } from "marked";

// Tuned empirically against the real master resume so that the tailoring
// prompts' content budgets (<=6 skill lines, <=12 experience bullets,
// 2 projects) render to exactly one Letter page - the ATS gate enforces
// that page count, so typography and budgets must agree. The previous
// looser styles made one page unreachable even with fully compliant
// content.
const RESUME_STYLES = `
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #222;
    font-size: 10pt;
    line-height: 1.22;
  }
  h1 { font-size: 16pt; margin: 0 0 1pt; }
  h2 {
    font-size: 10.5pt;
    border-bottom: 1px solid #444;
    margin-top: 6pt;
    margin-bottom: 2pt;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
  }
  p { margin: 2pt 0; }
  ul { margin: 1pt 0 2pt; padding-left: 14pt; }
  li { margin: 1pt 0; }
`;

class PdfRenderService {
  /**
   * Renders master-resume markdown (with tailored sections already
   * substituted in) to a PDF buffer via Playwright - no external binary
   * (e.g. LibreOffice) required, since Chromium is already a project
   * dependency for the LinkedIn provider.
   */
  async render(markdown: string): Promise<Buffer> {
    // breaks: true renders single newlines as <br> - without it the
    // Skills section's category lines soft-wrap into one merged
    // paragraph ("Languages: ... SQL Frontend & Mobile: ...").
    const html = this.wrapHtml(marked.parse(markdown, { breaks: true }) as string);

    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      return await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: { top: "0.4in", bottom: "0.4in", left: "0.5in", right: "0.5in" }
      });
    } finally {
      await browser.close();
    }
  }

  private wrapHtml(body: string): string {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>${RESUME_STYLES}</style>
</head>
<body>${body}</body>
</html>`;
  }
}

export default new PdfRenderService();
