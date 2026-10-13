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

test('strict public-text gate fails closed (pr-lint.yml)', () => {
  const prLint = readFileSync(new URL('../.github/workflows/pr-lint.yml', import.meta.url), 'utf8');
  // The strict gate lives inline in the workflow; test that exact block, not a copy.
  const marker = 'shell: python3 {0}';
  const start = prLint.indexOf(marker);
  assert.notEqual(start, -1, 'missing python gate step');
  const block = prLint.slice(start).match(/^        run: \|\n((?:          .*\n|\n)+)/m);
  assert.ok(block, 'missing inline python gate run block');
  const code = block[1].replace(/^          /gm, '');
  assert.match(code, /STRICT_INTERNAL_LEVEL/, 'gate must read STRICT_INTERNAL_LEVEL');
  assert.match(code, /TRACKER_ID/, 'gate must check tracker ids');
  // Pin the shipped level: the workflow's top-level env is what production runs,
  // so a downgrade there must turn this test red (fail-closed).
  const shipped = prLint.match(/^env:\n(?:  .*\n)*?  STRICT_INTERNAL_LEVEL: "([^"]+)"/m);
  assert.ok(shipped, 'workflow must declare STRICT_INTERNAL_LEVEL in top-level env');
  assert.equal(shipped[1], 'error', 'shipped STRICT_INTERNAL_LEVEL must be error (fail-closed)');

  const dir = mkdtempSync(join(tmpdir(), 'pr-lint-strict-'));
  try {
    const gate = join(dir, 'gate.py');
    writeFileSync(gate, code);
    const runGate = ({ title, body, level = shipped[1] }) => run('python3', [gate], dir, {
      EVENT: 'pull_request',
      TITLE: title,
      BODY: body,
      AUTHOR: 'fixture-user',
      COMMITS: '[]',
      STRICT_INTERNAL_LEVEL: level,
    });

    const cleanTitle = 'fix(ci): fail strict internal refs in title and body';
    const cleanBody = 'This change updates the lint wording and adds a committed regression test for the gate.';
    const clean = runGate({ title: cleanTitle, body: cleanBody });
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);

    // The unfilled template ("Refs: TOG-" with no digits) must still pass.
    const unfilled = runGate({ title: cleanTitle, body: `${cleanBody}\n\nRefs: TOG-` });
    assert.equal(unfilled.status, 0, unfilled.stdout + unfilled.stderr);

    const cases = [
      { name: 'tracker id in title', title: 'fix(ci): address TOG-1234 fallout', body: cleanBody },
      { name: 'tracker id in body', title: cleanTitle, body: `${cleanBody}\n\nRefs: TOG-1234` },
      { name: 'instance UI link', title: cleanTitle, body: `${cleanBody} See /TOG/issues/123 for context.` },
      { name: 'internal host in mixed case', title: cleanTitle, body: `${cleanBody} Hosted on InFeXtIoN.nEt internally.` },
    ];
    for (const { name, title, body } of cases) {
      const result = runGate({ title, body });
      assert.equal(result.status, 1, `${name} must fail: ${result.stdout}${result.stderr}`);
      assert.match(result.stdout + result.stderr, /Strict internal ref/, `${name} must report the strict gate`);
    }

    const downgraded = runGate({ title: cleanTitle, body: `${cleanBody}\n\nRefs: TOG-1234`, level: 'warning' });
    assert.equal(downgraded.status, 0, downgraded.stdout + downgraded.stderr);

    const garbage = runGate({ title: cleanTitle, body: `${cleanBody}\n\nRefs: TOG-1234`, level: 'off' });
    assert.equal(garbage.status, 1, `garbage level must fail closed: ${garbage.stdout}${garbage.stderr}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
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
