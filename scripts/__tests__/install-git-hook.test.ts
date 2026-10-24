/** @jest-environment node */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const installer = join(__dirname, '..', 'install-git-hook.mjs');

// Git runs the hook with the system `sh`: dash on Debian/Ubuntu, bash on macOS.
// They differ on stray syntax (a bare `.` is a no-op in dash, an error in bash),
// so the hook is exercised under each one available.
const shells = ['/bin/sh', '/bin/bash'].filter((sh) => existsSync(sh));

/**
 * Runs the installed hook in `shell`. The hook is sourced with `pnpm` defined as
 * a shell function rather than a fake binary, so the test doesn't need an
 * exec-mounted temp dir.
 */
function runHook(shell: string, hookPath: string, pnpmBody: string | null) {
  const stub = pnpmBody === null ? '' : `pnpm() { ${pnpmBody}; }; `;
  return spawnSync(shell, ['-c', `${stub}. "$1"`, 'sh', hookPath], {
    encoding: 'utf8',
    env: { ...process.env, PATH: '/nonexistent' },
  });
}

describe('install-git-hook', () => {
  let repo: string;
  let hookPath: string;

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'hook-test-'));
    hookPath = join(repo, '.git', 'hooks', 'pre-commit');
    const result = spawnSync(process.execPath, [installer], { cwd: repo, encoding: 'utf8' });
    expect(result.status).toBe(0);
  });

  afterEach(() => rmSync(repo, { recursive: true, force: true }));

  it('installs an executable pre-commit hook', () => {
    expect(statSync(hookPath).mode & 0o111).toBe(0o111);
  });

  describe.each(shells)('under %s', (shell) => {
    it('passes when pnpm precommit passes', () => {
      const result = runHook(shell, hookPath, '[ "$*" = "run -s precommit" ]');

      expect(result.stderr).toBe('');
      expect(result.status).toBe(0);
    });

    it('fails when pnpm precommit fails', () => {
      const result = runHook(shell, hookPath, 'return 1');

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('precommit failed');
    });

    it('fails when pnpm is not installed', () => {
      const result = runHook(shell, hookPath, null);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('pnpm not found');
    });
  });
});
