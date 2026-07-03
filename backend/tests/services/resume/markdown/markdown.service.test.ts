import { describe, it, expect } from "vitest";
import markdownService from "../../../../src/services/resume/markdown/markdown.service";

const SAMPLE = `# Jane Doe
jane@example.com

## Skills
TypeScript, React

## Experience
Software Engineer at Acme.

## Projects
JobFlowAI - a job search tool.
`;

describe("MarkdownService.extract", () => {
  it("extracts a middle section up to the next heading", () => {
    expect(markdownService.extract(SAMPLE, "Skills")).toBe(
      "TypeScript, React"
    );
  });

  it("extracts the last section through the end of the document", () => {
    expect(markdownService.extract(SAMPLE, "Projects")).toBe(
      "JobFlowAI - a job search tool."
    );
  });

  it("throws when the section heading doesn't exist", () => {
    expect(() => markdownService.extract("# No sections here", "Skills")).toThrow(
      /Section "Skills" not found/
    );
  });
});

describe("MarkdownService.replace", () => {
  it("replaces a section's content while preserving everything else", () => {
    const result = markdownService.replace(
      SAMPLE,
      "Skills",
      "Go, Rust, Kubernetes"
    );

    expect(markdownService.extract(result, "Skills")).toBe(
      "Go, Rust, Kubernetes"
    );
    expect(markdownService.extract(result, "Experience")).toBe(
      "Software Engineer at Acme."
    );
    expect(result).toContain("# Jane Doe");
    expect(result).toContain("jane@example.com");
  });

  it("replaces the last section correctly", () => {
    const result = markdownService.replace(
      SAMPLE,
      "Projects",
      "New Project - does new things."
    );

    expect(markdownService.extract(result, "Projects")).toBe(
      "New Project - does new things."
    );
  });
});
