class LatexService {
  extract(
    latex: string,
    block: "SKILLS" | "EXPERIENCE" | "PROJECTS"
  ) {
    const start = `% JOBFLOW:${block}_START`;
    const end = `% JOBFLOW:${block}_END`;

    const startIndex = latex.indexOf(start);
    const endIndex = latex.indexOf(end);

    if (startIndex === -1 || endIndex === -1)
      throw new Error(`${block} markers not found.`);

    return latex.substring(
      startIndex + start.length,
      endIndex
    ).trim();
  }

  replace(
    latex: string,
    block: "SKILLS" | "EXPERIENCE" | "PROJECTS",
    content: string
  ) {
    const start = `% JOBFLOW:${block}_START`;
    const end = `% JOBFLOW:${block}_END`;

    const startIndex = latex.indexOf(start);
    const endIndex = latex.indexOf(end);

    if (startIndex === -1 || endIndex === -1)
      throw new Error(`${block} markers not found.`);

    return (
      latex.substring(0, startIndex + start.length) +
      "\n\n" +
      content.trim() +
      "\n\n" +
      latex.substring(endIndex)
    );
  }
}

export default new LatexService();