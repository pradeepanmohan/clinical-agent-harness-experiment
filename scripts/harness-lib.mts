import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

export function parseArgs(argv = process.argv.slice(2)): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg?.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

export function requireString(value: string | boolean | undefined, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required --${name}`);
  }
  return value;
}

export function listChangedFiles(base: string): string[] {
  const committed = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
    encoding: 'utf8',
  });
  const workspace = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
  return Array.from(new Set([
    ...committed.split('\n').map((line) => line.trim()).filter(Boolean),
    ...workspace,
  ])).sort();
}

export function readPolicy(taskId: string): string[] {
  const raw = readFileSync('.harness/policies/allowed-files.json', 'utf8');
  const policy = JSON.parse(raw) as Record<string, string[]>;
  const patterns = policy[taskId];
  if (!patterns?.length) {
    throw new Error(`No allowed-files policy found for ${taskId}`);
  }
  return patterns;
}

export function taskEvidencePath(taskId: string): string {
  const raw = readFileSync('.harness/TASKS.json', 'utf8');
  const data = JSON.parse(raw) as { tasks?: Array<{ id?: string; taskFile?: string }> };
  const task = data.tasks?.find((entry) => entry.id === taskId);
  if (!task?.taskFile) return `.harness/evidence/${taskId}.md`;
  const slug = task.taskFile.split('/').pop()?.replace(/\.md$/, '').replace(/^S\d+-/, '') ?? taskId;
  return `.harness/evidence/${taskId}-${slug}.md`;
}

export function pathExists(path: string): boolean {
  return existsSync(path);
}

export function readText(path: string): string {
  return readFileSync(path, 'utf8');
}

export function matchesPattern(file: string, pattern: string): boolean {
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3);
    return file === prefix || file.startsWith(`${prefix}/`);
  }
  if (!pattern.includes('*')) return file === pattern;

  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '§DOUBLE_STAR§')
    .replace(/\*/g, '[^/]*')
    .replace(/§DOUBLE_STAR§/g, '.*');
  return new RegExp(`^${escaped}$`).test(file);
}
