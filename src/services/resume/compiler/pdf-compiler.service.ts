import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

// DOCX -> PDF conversion via LibreOffice headless, since the resume
// engine now generates DOCX (not LaTeX). No pure-JS library reliably
// preserves DOCX formatting when rendering to PDF, so this shells out to
// `soffice`/`libreoffice` rather than pulling in another dependency.
const CANDIDATE_BINARIES = [
  "soffice",
  "libreoffice",
  "/Applications/LibreOffice.app/Contents/MacOS/soffice"
];

class PdfCompilerService {
  async compile(docxPath: string): Promise<string> {
    const binary = await this.resolveBinary();
    const outDir = path.dirname(docxPath);

    await this.runConversion(binary, docxPath, outDir);

    const pdfPath = docxPath.replace(/\.docx$/i, ".pdf");
    await fs.access(pdfPath);

    return pdfPath;
  }

  private async resolveBinary(): Promise<string> {
    for (const candidate of CANDIDATE_BINARIES) {
      if (await this.isExecutable(candidate)) return candidate;
    }

    throw new Error(
      "LibreOffice (soffice) not found. Install it (e.g. \"brew install --cask libreoffice\" on macOS) to enable PDF compilation."
    );
  }

  private isExecutable(binary: string): Promise<boolean> {
    return new Promise(resolve => {
      const check = spawn(binary, ["--version"]);
      check.on("error", () => resolve(false));
      check.on("exit", code => resolve(code === 0));
    });
  }

  private runConversion(
    binary: string,
    docxPath: string,
    outDir: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(binary, [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        outDir,
        docxPath
      ]);

      let stderr = "";
      proc.stderr?.on("data", chunk => {
        stderr += chunk;
      });

      proc.on("error", reject);
      proc.on("exit", code => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              `LibreOffice PDF conversion failed (exit code ${code}): ${stderr}`
            )
          );
        }
      });
    });
  }
}

export default new PdfCompilerService();
