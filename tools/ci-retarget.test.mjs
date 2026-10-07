import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

// Read the real inline steps, not a second copy of the detector or dependency gate.
// Refuse an unknown layout rather than silently stop testing the workflow.
function step(marker) {
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, `missing step: ${marker}`);
  const block = workflow.slice(start).match(/^        run: \|\n((?:          .*\n|\n)+)/m);
  assert.ok(block, `missing inline run block: ${marker}`);
  return block[1].replace(/^          /gm, '');
}

const detect = step('- id: detect');
const noDependencies = step('- name: No dependencies');

// No credentials, hooks or personal Git configuration in the disposable fixture.
const env = {
  PATH: process.env.PATH,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
};

function run(command, args, cwd, extraEnv = {}) {
  const result = spawnSync(command, args, { cwd, env: { ...env, ...extraEnv }, encoding: 'utf8' });
  assert.ifError(result.error);
  return result;
}

function git(cwd, ...args) {
  const result = run('git', [
    '-c', 'user.name=CI fixture', '-c', 'user.email=ci@example.invalid',
    '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args,
  ], cwd);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('CI, secret scan and PR lint rerun on base edits, including drafts', () => {
  for (const file of ['ci.yml', 'secret-scan.yml', 'pr-lint.yml']) {
    const text = readFileSync(new URL(`../.github/workflows/${file}`, import.meta.url), 'utf8');
    // These zero-dependency workflows keep their activity allowlists inline.
    const types = text.match(/^  pull_request:\n(?:    #.*\n)*    types: \[([^\]]+)\]$/m);
    assert.ok(types, `${file}: explicit pull_request activity types required`);
    const activities = types[1].split(',').map(value => value.trim());
    for (const activity of ['opened', 'edited', 'synchronize', 'reopened', 'ready_for_review']) {
      assert.ok(activities.includes(activity), `${file}: missing ${activity}`);
    }
  }
});

test('the same docs-only head runs the gates after retargeting to main', () => {
  const scratch = process.env.TMPDIR || tmpdir();
  const cwd = mkdtempSync(join(scratch, 'ci-retarget-'));
  try {
    git(cwd, 'init', '-q', '--initial-branch=main');
    writeFileSync(join(cwd, 'package.json'), '{}\n');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-qm', 'chore: create fixture');
    const main = git(cwd, 'rev-parse', 'HEAD');

    git(cwd, 'checkout', '-qb', 'feature');
    writeFileSync(join(cwd, 'package.json'), '{"dependencies":{"fixture":"1.0.0"}}\n');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-qm', 'chore: add fixture dependency');
    const feature = git(cwd, 'rev-parse', 'HEAD');

    git(cwd, 'checkout', '-qb', 'docs');
    writeFileSync(join(cwd, 'README.md'), 'Fixture documentation.\n');
    git(cwd, 'add', '.');
    git(cwd, 'commit', '-qm', 'docs: describe fixture');
    const head = git(cwd, 'rev-parse', 'HEAD');
    const output = join(cwd, 'github-output');

    for (const [base, expected] of [[feature, 'false'], [main, 'true']]) {
      writeFileSync(output, '');
      const result = run('bash', ['-c', detect], cwd, {
        EVENT: 'pull_request', BASE_SHA: base, HEAD_SHA: head, GITHUB_OUTPUT: output,
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(readFileSync(output, 'utf8'), `code=${expected}\n`);
      assert.equal(git(cwd, 'rev-parse', 'HEAD'), head, 'retargeting must not change the head');
    }

    const gate = run('bash', ['-c', noDependencies], cwd);
    assert.equal(gate.status, 1, gate.stdout + gate.stderr);
    assert.match(gate.stdout, /two-design has grown a dependency/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
