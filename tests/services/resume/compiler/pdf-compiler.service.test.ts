import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";

const { mockSpawn, mockAccess } = vi.hoisted(() => ({
  mockSpawn: vi.fn(),
  mockAccess: vi.fn()
}));

vi.mock("child_process", () => ({
  spawn: mockSpawn
}));

vi.mock("fs/promises", () => ({
  default: { access: mockAccess },
  access: mockAccess
}));

import pdfCompilerService from "../../../../src/services/resume/compiler/pdf-compiler.service";

class FakeProcess extends EventEmitter {
  stderr = new EventEmitter();
}

describe("PdfCompilerService.compile", () => {
  beforeEach(() => {
    mockSpawn.mockReset();
    mockAccess.mockReset();
  });

  it("converts the docx to pdf using the first available binary", async () => {
    mockAccess.mockResolvedValue(undefined);

    mockSpawn.mockImplementation((binary: string, args: string[]) => {
      const proc = new FakeProcess();
      // First call for any binary is the --version check (succeeds
      // immediately for "soffice"), second is the actual conversion.
      if (args[0] === "--version") {
        queueMicrotask(() => proc.emit("exit", 0));
      } else {
        queueMicrotask(() => proc.emit("exit", 0));
      }
      return proc;
    });

    const result = await pdfCompilerService.compile(
      "storage/resumes/generated/acme.docx"
    );

    expect(result).toBe("storage/resumes/generated/acme.pdf");
    expect(mockSpawn).toHaveBeenCalledWith("soffice", ["--version"]);
    expect(mockSpawn).toHaveBeenCalledWith(
      "soffice",
      [
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        "storage/resumes/generated",
        "storage/resumes/generated/acme.docx"
      ]
    );
  });

  it("throws a clear error when no LibreOffice binary is found", async () => {
    mockSpawn.mockImplementation(() => {
      const proc = new FakeProcess();
      queueMicrotask(() => proc.emit("error", new Error("ENOENT")));
      return proc;
    });

    await expect(
      pdfCompilerService.compile("storage/resumes/generated/acme.docx")
    ).rejects.toThrow(/LibreOffice \(soffice\) not found/);
  });

  it("throws with stderr output when conversion exits non-zero", async () => {
    let call = 0;
    mockSpawn.mockImplementation((_binary: string, args: string[]) => {
      const proc = new FakeProcess();
      call += 1;
      if (args[0] === "--version") {
        queueMicrotask(() => proc.emit("exit", 0));
      } else {
        queueMicrotask(() => {
          proc.stderr.emit("data", "conversion failed: bad file");
          proc.emit("exit", 1);
        });
      }
      return proc;
    });

    await expect(
      pdfCompilerService.compile("storage/resumes/generated/acme.docx")
    ).rejects.toThrow(/LibreOffice PDF conversion failed/);
    expect(call).toBeGreaterThan(0);
  });
});
