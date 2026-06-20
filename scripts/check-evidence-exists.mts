import { parseArgs, pathExists, requireString, taskEvidencePath } from './harness-lib.mjs';

const args = parseArgs();
const task = requireString(args.task, 'task');
const evidence = typeof args.evidence === 'string' ? args.evidence : taskEvidencePath(task);

if (!pathExists(evidence)) {
  console.error(`Missing evidence file for ${task}: ${evidence}`);
  process.exit(1);
}

console.log(`Evidence file exists for ${task}: ${evidence}`);
