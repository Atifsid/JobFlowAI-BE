import fs from "fs/promises";
import { ResumeBlocks } from "../../models/resume-blocks.model";
import { buildStarterTemplateDocx } from "./docx/build-starter-template";

const MASTER_TEMPLATE_PATH = "storage/resumes/master.docx";
const MASTER_RESUME_PATH = "storage/resumes/master-resume.json";
const GENERATED_DIR = "storage/resumes/generated";

const STARTER_MASTER_RESUME: ResumeBlocks = {
  skills: "TypeScript, JavaScript, Node.js, React, SQL",
  experience:
    "Software Engineer at Example Corp - built and maintained web applications.",
  projects: "JobFlowAI - AI-assisted job search and application tracker."
};

class ResumeService {
  async getMasterTemplate(): Promise<Buffer> {
    try {
      return await fs.readFile(MASTER_TEMPLATE_PATH);
    } catch {
      const buffer = buildStarterTemplateDocx();
      await fs.mkdir("storage/resumes", { recursive: true });
      await fs.writeFile(MASTER_TEMPLATE_PATH, buffer);
      return buffer;
    }
  }

  async getMasterResume(): Promise<ResumeBlocks> {
    try {
      const raw = await fs.readFile(MASTER_RESUME_PATH, "utf8");
      return JSON.parse(raw);
    } catch {
      await fs.mkdir("storage/resumes", { recursive: true });
      await fs.writeFile(
        MASTER_RESUME_PATH,
        JSON.stringify(STARTER_MASTER_RESUME, null, 2)
      );
      return STARTER_MASTER_RESUME;
    }
  }

  async save(company: string, title: string, content: Buffer) {
    const fileName = `${company}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const path = `${GENERATED_DIR}/${fileName}.docx`;
    await fs.mkdir(GENERATED_DIR, { recursive: true });
    await fs.writeFile(path, content);
    return path;
  }
}

export default new ResumeService();
