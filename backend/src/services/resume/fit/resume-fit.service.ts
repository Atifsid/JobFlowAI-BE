// Deterministic content-budget enforcement. The model is asked to obey
// budgets, but a small local model overshoots often enough that "please
// condense" retries were the main source of two-page resumes. Code trims
// instead: cap each section to its budget (keeping the first items - the
// model already ordered by relevance), and if the render still overflows
// one page, remove one bullet at a time until it fits. No AI calls here.

const MAX_SKILL_LINES = 6;
const MAX_BULLETS_PER_ROLE = 3;
const MAX_TOTAL_BULLETS = 12;
const MAX_PROJECTS = 2;
const MAX_BULLETS_PER_PROJECT = 2;

export interface ResumeSections {
  skills: string;
  experience: string;
  projects: string;
}

interface Block {
  header: string;
  bullets: string[];
}

class ResumeFitService {
  enforceBudgets(sections: ResumeSections): ResumeSections {
    return {
      skills: this.trimSkills(sections.skills),
      experience: this.trimExperience(sections.experience),
      projects: this.trimProjects(sections.projects)
    };
  }

  // One trim step for the page-fit loop. Removal priority (least
  // valuable content first): project bullets down to 1 per project ->
  // second project entirely -> skills lines down to 4 -> experience
  // bullets from the OLDEST role down to 1 per role. Returns null when
  // nothing is left to safely remove.
  trimOneStep(sections: ResumeSections): ResumeSections | null {
    const projects = this.parseBlocks(sections.projects);
    for (let i = projects.length - 1; i >= 0; i--) {
      if (projects[i].bullets.length > 1) {
        projects[i].bullets.pop();
        return { ...sections, projects: this.renderBlocks(projects) };
      }
    }
    if (projects.length > 1) {
      projects.pop();
      return { ...sections, projects: this.renderBlocks(projects) };
    }

    const skillLines = this.lines(sections.skills);
    if (skillLines.length > 4) {
      return { ...sections, skills: skillLines.slice(0, -1).join("\n") };
    }

    const roles = this.parseBlocks(sections.experience);
    for (let i = roles.length - 1; i >= 0; i--) {
      if (roles[i].bullets.length > 1) {
        roles[i].bullets.pop();
        return { ...sections, experience: this.renderBlocks(roles) };
      }
    }

    return null;
  }

  private trimSkills(text: string): string {
    return this.lines(text).slice(0, MAX_SKILL_LINES).join("\n");
  }

  private trimExperience(text: string): string {
    const roles = this.parseBlocks(text);

    let total = 0;
    for (const role of roles) {
      role.bullets = role.bullets.slice(0, MAX_BULLETS_PER_ROLE);
      total += role.bullets.length;
    }

    // Over the total budget: shave from the oldest (last-listed) role
    // first, never below 1 bullet per role.
    for (let i = roles.length - 1; total > MAX_TOTAL_BULLETS && i >= 0; i--) {
      while (roles[i].bullets.length > 1 && total > MAX_TOTAL_BULLETS) {
        roles[i].bullets.pop();
        total--;
      }
    }

    return this.renderBlocks(roles);
  }

  private trimProjects(text: string): string {
    const projects = this.parseBlocks(text).slice(0, MAX_PROJECTS);
    for (const project of projects) {
      project.bullets = project.bullets.slice(0, MAX_BULLETS_PER_PROJECT);
    }
    return this.renderBlocks(projects);
  }

  // Sections are "**Header** ..." lines each followed by "- bullet"
  // lines (the master resume's format, which the prompts preserve).
  private parseBlocks(text: string): Block[] {
    const blocks: Block[] = [];

    for (const line of this.lines(text)) {
      if (line.startsWith("**")) {
        blocks.push({ header: line, bullets: [] });
      } else if (line.startsWith("- ") && blocks.length > 0) {
        blocks[blocks.length - 1].bullets.push(line);
      }
      // Anything else (stray prose) is dropped - it isn't part of the
      // master's section format and only costs page space.
    }

    return blocks;
  }

  private renderBlocks(blocks: Block[]): string {
    return blocks
      .map(block => [block.header, ...block.bullets].join("\n"))
      .join("\n\n");
  }

  private lines(text: string): string[] {
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}

export default new ResumeFitService();
