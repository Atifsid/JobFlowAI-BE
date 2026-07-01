import PizZip from "pizzip";

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const PACKAGE_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const paragraph = (text: string) => `<w:p><w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;

const DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${paragraph("MASTER RESUME")}
${paragraph("Skills")}
${paragraph("{{SKILLS_SECTION}}")}
${paragraph("Experience")}
${paragraph("{{EXPERIENCE_BULLETS}}")}
${paragraph("Projects")}
${paragraph("{{PROJECTS_SECTION}}")}
<w:sectPr/>
</w:body>
</w:document>`;

/**
 * Builds a minimal valid DOCX (as a Buffer) containing the tagged sections
 * docxtemplater fills in. Used to bootstrap `storage/resumes/master.docx`
 * on first run, and as a fixture in tests.
 */
export const buildStarterTemplateDocx = (): Buffer => {
  const zip = new PizZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", PACKAGE_RELS);
  zip.file("word/document.xml", DOCUMENT_XML);
  return zip.generate({ type: "nodebuffer" });
};
