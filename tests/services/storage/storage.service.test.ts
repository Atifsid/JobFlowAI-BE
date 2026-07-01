import { describe, it, expect, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import storageService from "../../../src/services/storage/storage.service";

const TEST_FOLDER = "test-read-all";
const TEST_DIR = path.join("storage", TEST_FOLDER);

describe("StorageService.readAll", () => {
  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it("returns every JSON file's parsed contents", async () => {
    await storageService.write(TEST_FOLDER, "a.json", { id: "a" });
    await storageService.write(TEST_FOLDER, "b.json", { id: "b" });

    const result = await storageService.readAll<{ id: string }>(TEST_FOLDER);

    expect(result).toHaveLength(2);
    expect(result.map(r => r.id).sort()).toEqual(["a", "b"]);
  });

  it("returns an empty array when the folder doesn't exist", async () => {
    const result = await storageService.readAll("does-not-exist");
    expect(result).toEqual([]);
  });
});
