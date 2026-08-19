#!/usr/bin/env node
/**
 * Asserts every colour pairing the TWO design system actually uses.
 *
 *   node tools/check-contrast.mjs
 *
 * It reads the hexes out of tokens/two.css, so it cannot drift from the
 * tokens. Change a colour, run this, or find out on launch day.
 *
 * Exit code 1 on any failure. Wire it into CI (TWO-22).
 *
 * Thresholds are WCAG 2.2 AA:
 *   4.5:1  normal text
 *   3.0:1  large text (>=24px, or >=18.66px bold)
 *   3.0:1  UI component boundaries and meaningful graphics (1.4.11)
 *
 * Note on what is NOT asserted: --color-line is decorative separation between
 * two non-interactive surfaces. 1.4.11 does not apply to it and it is under
 * 3:1 on purpose. If you ever use it as an input border, that is a bug — use
 * --color-line-strong.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, '..', 'tokens', 'two.css'), 'utf8');

/** Pull `--color-foo: #aabbcc;` pairs out of the theme block. */
const tokens = {};
for (const m of css.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  tokens[m[1]] = m[2].toLowerCase();
}

const t = (name) => {
  const v = tokens[`--color-${name}`];
  if (!v) {
    console.error(`\n  MISSING TOKEN: --color-${name} is not defined in tokens/two.css`);
    process.exit(1);
  }
  return v;
};

const channel = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const GROUNDS = ['canvas', 'surface', 'raised'];

/** [description, foreground token, background token, required ratio] */
const ASSERTIONS = [
  // --- body and secondary text on every ground -----------------------------
  ...GROUNDS.map((g) => [`ink on ${g}`, 'ink', g, 4.5]),
  ...GROUNDS.map((g) => [`ink-muted on ${g}`, 'ink-muted', g, 4.5]),

  // Disabled text is contrast-exempt under WCAG. We hold it to 3:1 anyway so
  // a disabled RSVP button still reads as a button and not as a smudge.
  ...GROUNDS.map((g) => [`ink-disabled on ${g} (self-imposed)`, 'ink-disabled', g, 3.0]),

  // --- the join button, in all three of its states -------------------------
  ['on-brand text on brand fill', 'on-brand', 'brand', 4.5],
  ['on-brand text on brand-hover fill', 'on-brand', 'brand-hover', 4.5],
  ['on-brand text on brand-active fill', 'on-brand', 'brand-active', 4.5],

  // The filled button must be discernible from the page behind it (1.4.11).
  ['brand fill against canvas', 'brand', 'canvas', 3.0],
  ['brand fill against surface', 'brand', 'surface', 3.0],

  // --- crimson as text -----------------------------------------------------
  ...GROUNDS.map((g) => [`brand-ink link on ${g}`, 'brand-ink', g, 4.5]),
  ['brand-ink on brand-quiet badge', 'brand-ink', 'brand-quiet', 4.5],

  // --- interactive control boundaries (1.4.11) -----------------------------
  ...GROUNDS.map((g) => [`line-strong control border on ${g}`, 'line-strong', g, 3.0]),

  // --- focus ring must clear 3:1 on everything it can land on --------------
  ...GROUNDS.map((g) => [`focus ring on ${g}`, 'focus', g, 3.0]),
  ['focus ring on a crimson button', 'focus', 'brand', 3.0],
  ['focus ring on the violet band', 'focus', 'violet', 3.0],

  // --- the violet band is a ground too, so text must survive on it ---------
  ['ink on violet band', 'ink', 'violet', 4.5],
  ['ink-muted on violet band', 'ink-muted', 'violet', 4.5],
  ['brand fill against violet band', 'brand', 'violet', 3.0],

  // --- presence ------------------------------------------------------------
  ...GROUNDS.map((g) => [`online text on ${g}`, 'online', g, 4.5]),
  ['online on its quiet ground', 'online', 'online-quiet', 4.5],
  // The online dot is a meaningful graphic, not decoration.
  ['online dot against surface', 'online', 'surface', 3.0],

  // --- alerts --------------------------------------------------------------
  ...GROUNDS.map((g) => [`alert text on ${g}`, 'alert', g, 4.5]),
  ['alert on its quiet ground', 'alert', 'alert-quiet', 4.5],
  ['alert-quiet panel against surface', 'alert-quiet', 'surface', 1.0], // ground only
  ['ink on alert-quiet panel', 'ink', 'alert-quiet', 4.5],
  ['ink on brand-quiet panel', 'ink', 'brand-quiet', 4.5],
  ['ink on online-quiet panel', 'ink', 'online-quiet', 4.5],

  // --- crimson and amber must be separable from each other -----------------
  // Not a WCAG rule; ours. If a crimson button and an amber error sit in the
  // same card they cannot read as the same thing at a glance.
  ['brand-ink vs alert (must differ in lightness)', 'brand-ink', 'alert', 1.35],
];

let failed = 0;
let width = 0;
for (const [label] of ASSERTIONS) width = Math.max(width, label.length);

console.log('\nTWO design system — WCAG 2.2 AA contrast assertions\n');

for (const [label, fg, bg, need] of ASSERTIONS) {
  const a = t(fg);
  const b = t(bg);
  const r = contrast(a, b);
  const ok = r >= need;
  if (!ok) failed++;
  console.log(
    `  ${ok ? 'ok  ' : 'FAIL'}  ${String(r.toFixed(2)).padStart(5)} : 1  ` +
      `(needs ${need.toFixed(1)})  ${label.padEnd(width)}  ${a} on ${b}`
  );
}

const total = ASSERTIONS.length;
console.log(
  `\n${total - failed}/${total} pairings pass.` +
    (failed ? `  ${failed} FAILED — do not merge.\n` : '  \n')
);

process.exit(failed ? 1 : 0);
