import { execFileSync } from 'node:child_process';
import { parseArgs, requireString } from './harness-lib.mjs';

const args = parseArgs();
const task = requireString(args.task, 'task');
const base = typeof args.base === 'string' ? args.base : 'origin/main';
const evidenceArg = typeof args.evidence === 'string' ? ['--evidence', args.evidence] : [];

const commands: string[][] = [
  ['tsx', 'scripts/check-allowed-files.mts', '--task', task, '--base', base],
  ['tsx', 'scripts/check-evidence-exists.mts', '--task', task, ...evidenceArg],
  ['tsx', 'scripts/check-evidence-sections.mts', '--task', task, ...evidenceArg],
];

for (const command of commands) {
  console.log(`$ ${command.join(' ')}`);
  execFileSync(command[0]!, command.slice(1), { stdio: 'inherit' });
}

console.log(`Harness checks passed for ${task}.`);
