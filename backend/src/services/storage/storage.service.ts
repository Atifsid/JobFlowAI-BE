import fs from "fs/promises";
import path from "path";

class StorageService {
  async write(folder: string, file: string, data: unknown) {
    await fs.mkdir(path.join("storage", folder), { recursive: true });
    await fs.writeFile(path.join("storage", folder, file), JSON.stringify(data, null, 2));
  }

  async read<T>(folder: string, file: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(path.join("storage", folder, file), "utf8"));
    } catch {
      return null;
    }
  }

  async exists(folder: string, file: string) {
    try {
      await fs.access(path.join("storage", folder, file));
      return true;
    } catch {
      return false;
    }
  }

  async readAll<T>(folder: string): Promise<T[]> {
    const dir = path.join("storage", folder);
    let files: string[];

    try {
      files = await fs.readdir(dir);
    } catch {
      return [];
    }

    const jsonFiles = files.filter(file => file.endsWith(".json"));
    const contents = await Promise.all(
      jsonFiles.map(file => fs.readFile(path.join(dir, file), "utf8"))
    );

    return contents.map(content => JSON.parse(content));
  }
}

export default new StorageService();