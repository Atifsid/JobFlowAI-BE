import fs from "fs/promises";
import { Resume } from "../../models/resume.model";

class ResumeService {
  async getMaster(): Promise<Resume> {
    const content = await fs.readFile("resumes/master.md", "utf8");
    return { content, version: "master", createdAt: new Date() };
  }

  async save(company: string, title: string, content: string) {
    const file = `${company}-${title}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const path = `storage/resumes/generated/${file}.md`;

    await fs.writeFile(path, content);

    return path;
  }
}

export default new ResumeService();