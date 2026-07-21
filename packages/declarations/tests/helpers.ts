// AI generated test helpers
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/** Creates a unique temporary directory outside the repository. */
export function createTempDir(prefix = "decl-") {
  return fs.mkdtemp(join(tmpdir(), prefix));
}

/** Removes a directory tree, ignoring missing paths. */
export function removeTempDir(dir: string) {
  return fs.rm(dir, { recursive: true, force: true });
}

/** Writes a JSON fixture file and returns its path. */
export async function writeJson(path: string, data: unknown) {
  await fs.writeFile(path, JSON.stringify(data), "utf-8");
  return path;
}

/** Resolves to true when the path exists. */
export function exists(path: string) {
  return fs.access(path).then(
    () => true,
    () => false,
  );
}

/** Polls a condition until it holds or the timeout elapses. */
export async function waitFor(condition: () => boolean | Promise<boolean>, timeout = 3000, interval = 15) {
  const start = Date.now();
  while (!(await condition())) {
    if (Date.now() - start > timeout) throw new Error("Timed out while waiting for a condition");
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
