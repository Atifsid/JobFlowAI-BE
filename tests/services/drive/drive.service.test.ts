import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockFilesCreate, mockFilesGet, mockPermissionsCreate } = vi.hoisted(
  () => ({
    mockFilesCreate: vi.fn(),
    mockFilesGet: vi.fn(),
    mockPermissionsCreate: vi.fn()
  })
);

vi.mock("../../../src/services/drive/google-drive.client", () => ({
  default: {
    files: { create: mockFilesCreate, get: mockFilesGet },
    permissions: { create: mockPermissionsCreate }
  }
}));

vi.mock("fs", () => ({
  default: { createReadStream: vi.fn().mockReturnValue("fake-stream") },
  createReadStream: vi.fn().mockReturnValue("fake-stream")
}));

describe("DriveService.upload", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFilesCreate.mockReset();
    mockFilesGet.mockReset();
    mockPermissionsCreate.mockReset();
  });

  afterEach(() => {
    delete process.env.GOOGLE_DRIVE_FOLDER_ID;
  });

  it("throws a clear setup error when no Drive folder is configured", async () => {
    process.env.GOOGLE_DRIVE_FOLDER_ID = "";
    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    await expect(driveService.upload("x.pdf", "x.pdf")).rejects.toThrow(
      /GOOGLE_DRIVE_FOLDER_ID is not set/
    );
    expect(mockFilesCreate).not.toHaveBeenCalled();
  });

  it("uploads into the configured folder, shares it, and returns the webViewLink", async () => {
    process.env.GOOGLE_DRIVE_FOLDER_ID = "folder-abc";
    mockFilesCreate.mockResolvedValue({ data: { id: "file123" } });
    mockPermissionsCreate.mockResolvedValue({});
    mockFilesGet.mockResolvedValue({
      data: { webViewLink: "https://drive.google.com/file/d/file123/view" }
    });

    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    const link = await driveService.upload(
      "storage/resumes/generated/acme.pdf",
      "acme.pdf"
    );

    expect(mockFilesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: { name: "acme.pdf", parents: ["folder-abc"] },
        fields: "id"
      })
    );
    expect(mockPermissionsCreate).toHaveBeenCalledWith({
      fileId: "file123",
      requestBody: { role: "reader", type: "anyone" }
    });
    expect(link).toBe("https://drive.google.com/file/d/file123/view");
  });

  it("throws when the upload response has no file id", async () => {
    process.env.GOOGLE_DRIVE_FOLDER_ID = "folder-abc";
    mockFilesCreate.mockResolvedValue({ data: {} });

    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    await expect(driveService.upload("x.pdf", "x.pdf")).rejects.toThrow(
      /did not return a file id/
    );
  });

  it("falls back to a constructed link when webViewLink is missing", async () => {
    process.env.GOOGLE_DRIVE_FOLDER_ID = "folder-abc";
    mockFilesCreate.mockResolvedValue({ data: { id: "file456" } });
    mockPermissionsCreate.mockResolvedValue({});
    mockFilesGet.mockResolvedValue({ data: {} });

    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    const link = await driveService.upload("x.pdf", "x.pdf");

    expect(link).toBe("https://drive.google.com/file/d/file456/view");
  });
});
