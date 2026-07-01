import { describe, it, expect } from "vitest";
import PizZip from "pizzip";
import docxService from "../../../../src/services/resume/docx/docx.service";
import { buildStarterTemplateDocx } from "../../../../src/services/resume/docx/build-starter-template";

const readDocumentXml = (docxBuffer: Buffer): string => {
  const zip = new PizZip(docxBuffer);
  return zip.file("word/document.xml")!.asText();
};

describe("DocxService.render", () => {
  it("replaces tagged sections with the provided data", () => {
    const template = buildStarterTemplateDocx();

    const output = docxService.render(template, {
      SKILLS_SECTION: "TypeScript, React, Node.js",
      EXPERIENCE_BULLETS: "Built things at Acme Corp.",
      PROJECTS_SECTION: "JobFlowAI - AI career assistant."
    });

    const xml = readDocumentXml(output);

    expect(xml).toContain("TypeScript, React, Node.js");
    expect(xml).toContain("Built things at Acme Corp.");
    expect(xml).toContain("JobFlowAI - AI career assistant.");
    expect(xml).not.toContain("{{SKILLS_SECTION}}");
    expect(xml).not.toContain("{{EXPERIENCE_BULLETS}}");
    expect(xml).not.toContain("{{PROJECTS_SECTION}}");
  });

  it("preserves untagged content unchanged", () => {
    const template = buildStarterTemplateDocx();

    const output = docxService.render(template, {
      SKILLS_SECTION: "a",
      EXPERIENCE_BULLETS: "b",
      PROJECTS_SECTION: "c"
    });

    const xml = readDocumentXml(output);

    expect(xml).toContain("MASTER RESUME");
    expect(xml).toContain("Skills");
    expect(xml).toContain("Experience");
    expect(xml).toContain("Projects");
  });
});
