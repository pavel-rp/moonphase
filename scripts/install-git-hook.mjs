#!/usr/bin/env node
import { mkdirSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

const hookDir = join(process.cwd(), '.git', 'hooks');
const hookPath = join(hookDir, 'pre-commit');

try {
  mkdirSync(hookDir, { recursive: true });
  const script = `#!/usr/bin/env sh\n. \\\n  && command -v pnpm >/dev/null 2>&1 \\\n  && pnpm run -s precommit \\\n  || { echo "pnpm not found or precommit failed"; exit 1; }\n`;
  writeFileSync(hookPath, script, { encoding: 'utf8' });
  chmodSync(hookPath, 0o755);
  console.log('✔ Installed .git/hooks/pre-commit to run pnpm precommit');
} catch (err) {
  console.error('✖ Failed to install pre-commit hook:', err);
  process.exit(1);
}

