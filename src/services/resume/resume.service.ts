import fs from "fs/promises";
import { Resume } from "../../models/resume.model";
import { ResumeTemplate } from "../../models/resume-template.model";

class ResumeService {
  async save(company: string, title: string, content: string) {
    const file = `${company}-${title}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const path = `storage/resumes/generated/${file}.md`;

    await fs.writeFile(path, content);

    return path;
  }

  async getTemplate(template: ResumeTemplate) {
    return fs.readFile(
      `storage/resumes/base/${template}.tex`,
      "utf8"
    );
  }
}

export default new ResumeService();