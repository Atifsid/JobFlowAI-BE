import { chromium } from "playwright";
import { marked } from "marked";

const RESUME_STYLES = `
  body {
    font-family: Georgia, "Times New Roman", serif;
    color: #222;
    font-size: 11pt;
    line-height: 1.4;
  }
  h1 { font-size: 20pt; margin-bottom: 2pt; }
  h2 {
    font-size: 13pt;
    border-bottom: 1px solid #444;
    margin-top: 14pt;
    margin-bottom: 6pt;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
  }
  p { margin: 4pt 0; }
  ul { margin: 4pt 0; padding-left: 18pt; }
`;

class PdfRenderService {
  /**
   * Renders master-resume markdown (with tailored sections already
   * substituted in) to a PDF buffer via Playwright - no external binary
   * (e.g. LibreOffice) required, since Chromium is already a project
   * dependency for the LinkedIn provider.
   */
  async render(markdown: string): Promise<Buffer> {
    const html = this.wrapHtml(marked.parse(markdown) as string);

    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      return await page.pdf({
        format: "Letter",
        printBackground: true,
        margin: { top: "0.6in", bottom: "0.6in", left: "0.6in", right: "0.6in" }
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
