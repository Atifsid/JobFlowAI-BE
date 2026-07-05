// Deterministic content-budget enforcement. The model is asked to obey
// budgets, but a small local model overshoots often enough that "please
// condense" retries were the main source of two-page resumes. Code trims
// instead: cap each section to its budget (keeping the first items - the
// model already ordered by relevance), and if the render still overflows
// one page, remove one bullet at a time until it fits. No AI calls here.

// These are upper bounds on the AI's initial selection only, not the real
// one-page constraint - both the trim loop (resume-tailor.service.ts) and
// growOneStep below re-render and measure actual PDF page count, so an
// overly conservative ceiling here just leaves the page under-filled
// without buying any real safety. Sized to comfortably cover a master
// resume with ~7 skill lines / ~7 bullets per role / ~4-7 projects; real
// page-fit measurement is what actually prevents overflow.
const MAX_SKILL_LINES = 7;
const MAX_BULLETS_PER_ROLE = 5;
const MAX_TOTAL_BULLETS = 20;
const MAX_PROJECTS = 4;
const MAX_BULLETS_PER_PROJECT = 3;

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

  // Inverse of trimOneStep: when the render lands comfortably under one
  // page, restore real content from the master's un-tailored sections
  // instead of leaving the page under-filled - never fabricated, only
  // content that was already available and got cut or never selected.
  // Priority mirrors trimOneStep in reverse: experience bullets (the
  // highest-value content, and the last thing trimOneStep removes) come
  // back first, then skill breadth, then project depth, then project
  // count. Returns null when there's nothing left in the master pool to
  // add that isn't already present.
  growOneStep(sections: ResumeSections, master: ResumeSections): ResumeSections | null {
    const tailoredRoles = this.parseBlocks(sections.experience);
    const masterRoles = this.parseBlocks(master.experience);

    for (const role of tailoredRoles) {
      const masterRole = masterRoles.find(r => r.header === role.header);
      if (!masterRole) continue;
      if (role.bullets.length >= MAX_BULLETS_PER_ROLE) continue;

      // Not index-based: the model rewords bullets rather than copying
      // them verbatim, so "the master bullet at this position" is often
      // already covered by a different, reworded tailored bullet.
      // Observed live: restoring by index re-added the same underlying
      // fact a second time, just missing the model's added clause.
      const next = masterRole.bullets.find(b => !this.isRedundant(b, role.bullets));
      if (next) {
        role.bullets.push(next);
        return { ...sections, experience: this.renderBlocks(tailoredRoles) };
      }
    }

    const skillLines = this.lines(sections.skills);
    if (skillLines.length < MAX_SKILL_LINES) {
      const category = (line: string) => line.split(":")[0].trim().toLowerCase();
      const present = new Set(skillLines.map(category));
      const nextLine = this.lines(master.skills).find(line => !present.has(category(line)));
      if (nextLine) {
        return { ...sections, skills: [...skillLines, nextLine].join("\n") };
      }
    }

    const tailoredProjects = this.parseBlocks(sections.projects);
    const masterProjects = this.parseBlocks(master.projects);

    for (const project of tailoredProjects) {
      const masterProject = masterProjects.find(p => p.header === project.header);
      if (!masterProject) continue;
      if (project.bullets.length >= MAX_BULLETS_PER_PROJECT) continue;

      const next = masterProject.bullets.find(b => !this.isRedundant(b, project.bullets));
      if (next) {
        project.bullets.push(next);
        return { ...sections, projects: this.renderBlocks(tailoredProjects) };
      }
    }

    if (tailoredProjects.length < MAX_PROJECTS) {
      const unused = masterProjects.find(p => !tailoredProjects.some(tp => tp.header === p.header));
      if (unused) {
        const grown = [
          ...tailoredProjects,
          { header: unused.header, bullets: unused.bullets.slice(0, MAX_BULLETS_PER_PROJECT) }
        ];
        return { ...sections, projects: this.renderBlocks(grown) };
      }
    }

    return null;
  }

  // Whether a candidate master bullet's content is already substantially
  // covered by one of the existing (reworded) bullets, by significant
  // word overlap rather than exact string equality - a straight ===
  // check never catches a duplicate the model has reworded.
  private isRedundant(candidate: string, existing: string[]): boolean {
    if (existing.includes(candidate)) return true;

    const words = (text: string) => new Set(text.toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
    const candidateWords = words(candidate);
    // Too little distinctive vocabulary to judge overlap meaningfully -
    // a single shared word shouldn't be enough to call it a duplicate.
    if (candidateWords.size < 3) return false;

    return existing.some(line => {
      const existingWords = words(line);
      const overlap = [...candidateWords].filter(w => existingWords.has(w)).length;
      return overlap / candidateWords.size > 0.6;
    });
  }

  private trimSkills(text: string): string {
    return this.sanitizeSkillLines(this.lines(text)).slice(0, MAX_SKILL_LINES).join("\n");
  }

  // Drops lines that aren't a real "Category: skill, skill" entry. Local
  // models occasionally emit meta-commentary about the resume itself
  // instead of an actual skill list - observed live:
  // "Testing: Testing (mentioned in project experience)" rendered
  // straight into a passing PDF. Deterministic filter, no retry needed.
  private sanitizeSkillLines(lines: string[]): string[] {
    return lines.filter(line => {
      const colon = line.indexOf(":");
      if (colon === -1) return false;

      const category = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (!category || !value) return false;
      if (/\b(mentioned|implied|as needed|n\/a|see (experience|projects))\b/i.test(value)) return false;
      if (value.toLowerCase() === category.toLowerCase()) return false;

      return true;
    });
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
