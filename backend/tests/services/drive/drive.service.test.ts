import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockFilesCreate, mockFilesGet, mockPermissionsCreate, mockExistsSync } =
  vi.hoisted(() => ({
    mockFilesCreate: vi.fn(),
    mockFilesGet: vi.fn(),
    mockPermissionsCreate: vi.fn(),
    mockExistsSync: vi.fn()
  }));

vi.mock("../../../src/services/drive/google-drive.client", () => ({
  default: {
    files: { create: mockFilesCreate, get: mockFilesGet },
    permissions: { create: mockPermissionsCreate }
  }
}));

vi.mock("fs", () => ({
  default: {
    createReadStream: vi.fn().mockReturnValue("fake-stream"),
    existsSync: mockExistsSync
  },
  createReadStream: vi.fn().mockReturnValue("fake-stream"),
  existsSync: mockExistsSync
}));

describe("DriveService.upload", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFilesCreate.mockReset();
    mockFilesGet.mockReset();
    mockPermissionsCreate.mockReset();
    mockExistsSync.mockReset();
  });

  afterEach(() => {
    delete process.env.GOOGLE_DRIVE_FOLDER_ID;
  });

  it("throws a clear setup error when no OAuth token exists", async () => {
    mockExistsSync.mockReturnValue(false);
    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    await expect(driveService.upload("x.pdf", "x.pdf")).rejects.toThrow(
      /npm run google:drive-login/
    );
    expect(mockFilesCreate).not.toHaveBeenCalled();
  });

  it("uploads without a parent folder when none is configured", async () => {
    mockExistsSync.mockReturnValue(true);
    process.env.GOOGLE_DRIVE_FOLDER_ID = "";
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
        requestBody: { name: "acme.pdf" },
        fields: "id"
      })
    );
    expect(mockPermissionsCreate).toHaveBeenCalledWith({
      fileId: "file123",
      requestBody: { role: "reader", type: "anyone" }
    });
    expect(link).toBe("https://drive.google.com/file/d/file123/view");
  });

  it("uploads into the configured folder when one is set", async () => {
    mockExistsSync.mockReturnValue(true);
    process.env.GOOGLE_DRIVE_FOLDER_ID = "folder-abc";
    mockFilesCreate.mockResolvedValue({ data: { id: "file123" } });
    mockPermissionsCreate.mockResolvedValue({});
    mockFilesGet.mockResolvedValue({
      data: { webViewLink: "https://drive.google.com/file/d/file123/view" }
    });

    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    await driveService.upload("storage/resumes/generated/acme.pdf", "acme.pdf");

    expect(mockFilesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: { name: "acme.pdf", parents: ["folder-abc"] }
      })
    );
  });

  it("throws when the upload response has no file id", async () => {
    mockExistsSync.mockReturnValue(true);
    mockFilesCreate.mockResolvedValue({ data: {} });

    const { default: driveService } = await import(
      "../../../src/services/drive/drive.service"
    );

    await expect(driveService.upload("x.pdf", "x.pdf")).rejects.toThrow(
      /did not return a file id/
    );
  });

  it("falls back to a constructed link when webViewLink is missing", async () => {
    mockExistsSync.mockReturnValue(true);
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
