import fs from "fs/promises";
import { Resume } from "../../models/resume.model";
import { ResumeTemplate } from "../../models/resume-template.model";

class ResumeService {
  async save(company: string, title: string, content: string) {
    const fileName = `${company}-${title}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const path = `storage/resumes/generated/${fileName}.tex`;
    await fs.writeFile(path, content, "utf8");
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