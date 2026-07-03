export type ResumeSection = "Skills" | "Experience" | "Projects";

class MarkdownService {
  /**
   * Extracts the text under a "## <Section>" heading, up to (but not
   * including) the next "## " heading or the end of the document.
   */
  extract(markdown: string, section: ResumeSection): string {
    const { start, end } = this.sectionBounds(markdown, section);
    return markdown.slice(start, end).trim();
  }

  /**
   * Replaces the text under a "## <Section>" heading with new content,
   * leaving everything else (headings, other sections) untouched.
   */
  replace(markdown: string, section: ResumeSection, content: string): string {
    const { start, end } = this.sectionBounds(markdown, section);
    return (
      markdown.slice(0, start) +
      "\n\n" +
      content.trim() +
      "\n\n" +
      markdown.slice(end)
    );
  }

  private sectionBounds(
    markdown: string,
    section: ResumeSection
  ): { start: number; end: number } {
    const headingRegex = new RegExp(`^## +${section} *$`, "m");
    const match = headingRegex.exec(markdown);

    if (!match) {
      throw new Error(`Section "${section}" not found in master resume.`);
    }

    const start = match.index + match[0].length;
    const rest = markdown.slice(start);
    const nextHeading = /^## +.+$/m.exec(rest);
    const end = nextHeading ? start + nextHeading.index : markdown.length;

    return { start, end };
  }
}

export default new MarkdownService();
