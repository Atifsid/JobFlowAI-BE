import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

class DocxService {
  render(templateBuffer: Buffer, data: Record<string, string>): Buffer {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: "{{", end: "}}" }
    });

    doc.render(data);

    return doc.getZip().generate({ type: "nodebuffer" });
  }
}

export default new DocxService();
