import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function collectTestFiles(rootDir: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.test.ts')) {
        results.push(entryPath);
      }
    }
  }

  await walk(rootDir);

  return results.sort((left, right) => left.localeCompare(right));
}

async function main(): Promise<void> {
  const testsRoot = resolve(process.cwd(), 'tests');
  const testFiles = await collectTestFiles(testsRoot);

  for (const filePath of testFiles) {
    process.stdout.write(`Running ${filePath}\n`);
    await import(pathToFileURL(filePath).href);
  }

  process.stdout.write(`\n${testFiles.length} test files completed successfully.\n`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});