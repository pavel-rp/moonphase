#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...options });
  return result.status ?? 1;
}

// Run preflight
const status = run('pnpm', ['run', '-s', 'preflight']);

if (status !== 0) {
  console.error('\n✖ Pre-commit aborted: preflight checks failed. Fix errors, then commit again.');
  process.exit(status);
}

console.log('✔ Preflight passed. Proceeding with commit.');

