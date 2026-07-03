import fs from "fs/promises";

const MASTER_RESUME_PATH = "storage/resumes/master.md";
const GENERATED_DIR = "storage/resumes/generated";

const STARTER_MASTER_RESUME = `# Jane Doe
jane.doe@example.com | linkedin.com/in/janedoe | github.com/janedoe

## Skills
TypeScript, JavaScript, Node.js, React, SQL

## Experience
Software Engineer at Example Corp - built and maintained web applications.

## Projects
JobFlowAI - AI-assisted job search and application tracker.
`;

class ResumeService {
  /**
   * The master resume is a single Markdown file: static content (name,
   * contact info, section headings) plus the text under "## Skills" /
   * "## Experience" / "## Projects" that AI tailors per job. Bootstraps a
   * placeholder file on first run - replace it with your real resume.
   */
  async getMasterResume(): Promise<string> {
    try {
      return await fs.readFile(MASTER_RESUME_PATH, "utf8");
    } catch {
      await fs.mkdir("storage/resumes", { recursive: true });
      await fs.writeFile(MASTER_RESUME_PATH, STARTER_MASTER_RESUME);
      return STARTER_MASTER_RESUME;
    }
  }

  async save(company: string, title: string, content: Buffer) {
    const fileName = `${company}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const path = `${GENERATED_DIR}/${fileName}.pdf`;
    await fs.mkdir(GENERATED_DIR, { recursive: true });
    await fs.writeFile(path, content);
    return path;
  }
}

export default new ResumeService();
