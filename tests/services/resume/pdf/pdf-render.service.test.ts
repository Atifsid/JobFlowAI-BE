import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockLaunch } = vi.hoisted(() => ({ mockLaunch: vi.fn() }));

vi.mock("playwright", () => ({
  chromium: { launch: mockLaunch }
}));

import pdfRenderService from "../../../../src/services/resume/pdf/pdf-render.service";

describe("PdfRenderService.render", () => {
  beforeEach(() => {
    mockLaunch.mockReset();
  });

  it("converts markdown to HTML, sets page content, and returns the PDF buffer", async () => {
    const fakePdfBuffer = Buffer.from("pdf-bytes");
    const setContent = vi.fn().mockResolvedValue(undefined);
    const pdf = vi.fn().mockResolvedValue(fakePdfBuffer);
    const page = { setContent, pdf };
    const browser = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined)
    };
    mockLaunch.mockResolvedValue(browser);

    const result = await pdfRenderService.render("# Hello\n\nWorld");

    expect(setContent).toHaveBeenCalledWith(
      expect.stringContaining("<h1>Hello</h1>"),
      expect.any(Object)
    );
    expect(pdf).toHaveBeenCalledWith(
      expect.objectContaining({ format: "Letter" })
    );
    expect(result).toBe(fakePdfBuffer);
    expect(browser.close).toHaveBeenCalled();
  });

  it("closes the browser even if rendering fails", async () => {
    const page = {
      setContent: vi.fn().mockRejectedValue(new Error("render failed")),
      pdf: vi.fn()
    };
    const browser = {
      newPage: vi.fn().mockResolvedValue(page),
      close: vi.fn().mockResolvedValue(undefined)
    };
    mockLaunch.mockResolvedValue(browser);

    await expect(pdfRenderService.render("# Hello")).rejects.toThrow(
      "render failed"
    );
    expect(browser.close).toHaveBeenCalled();
  });
});
