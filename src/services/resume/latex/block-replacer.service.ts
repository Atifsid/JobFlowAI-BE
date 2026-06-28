class BlockReplacerService {
  replace(
    latex: string,
    block: string,
    content: string
  ) {
    const regex = new RegExp(
      `%<${block}_START>[\\s\\S]*?%<${block}_END>`,
      "m"
    );

    return latex.replace(
      regex,
      `%<${block}_START>\n${content}\n%<${block}_END>`
    );
  }
}

export default new BlockReplacerService();