import { listChangedFiles, matchesPattern, parseArgs, readPolicy, requireString } from './harness-lib.mts';

const args = parseArgs();
const task = requireString(args.task, 'task');
const base = typeof args.base === 'string' ? args.base : 'origin/main';
const changedFiles = listChangedFiles(base);
const allowedPatterns = readPolicy(task);
const disallowed = changedFiles.filter(
  (file) => !allowedPatterns.some((pattern) => matchesPattern(file, pattern)),
);

if (disallowed.length > 0) {
  console.error(`Disallowed files changed for ${task}:`);
  for (const file of disallowed) console.error(`- ${file}`);
  console.error('\nAllowed patterns:');
  for (const pattern of allowedPatterns) console.error(`- ${pattern}`);
  process.exit(1);
}

console.log(`Allowed-files check passed for ${task}: ${changedFiles.length} changed file(s).`);
