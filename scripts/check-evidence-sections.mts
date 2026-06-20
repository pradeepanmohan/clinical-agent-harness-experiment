import { parseArgs, readText, requireString, taskEvidencePath } from './harness-lib.mjs';

const args = parseArgs();
const task = requireString(args.task, 'task');
const evidence = typeof args.evidence === 'string' ? args.evidence : taskEvidencePath(task);
const requiredSections = ['Summary', 'Changed files', 'Verification', 'Result'];
const text = readText(evidence);
const missing = requiredSections.filter(
  (section) => !new RegExp(`^##\\s+${section}\\b`, 'im').test(text),
);

if (missing.length > 0) {
  console.error(`Evidence file ${evidence} is missing required section(s): ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Evidence sections check passed for ${task}: ${requiredSections.join(', ')}.`);
