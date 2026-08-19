# Accessibility contract — WCAG 2.2 AA

AA is the floor. Most of it is already handled by the tokens; this file is the
part that is your job during the build, and how each item gets verified.

## Already done for you in `tokens/two.css`

You do not need to think about these. You need to not undo them.

- **Contrast.** All 43 colour pairings the system uses are asserted in
  `tools/check-contrast.mjs` and pass. Do not introduce a colour that is not a
  token; if you do, the assertion list will not cover it.
- **Focus visibility.** One global `:focus-visible` treatment on every
  focusable element, verified at ≥3:1 against every ground *and* against a
  crimson fill. **Never write `outline: none`.**
- **Reduced motion.** `prefers-reduced-motion` is honoured globally.
- **Colour scheme.** `color-scheme: dark` is declared, so form controls and
  scrollbars match instead of flashing white.

## Your job during the build

| Requirement | What it means here | SC |
|---|---|---|
| Semantic landmarks | One `<header>`, `<nav>`, `<main>`, `<footer>` per page. `<main>` wraps the page content and nothing else. | 1.3.1 |
| Heading order | One `<h1>` per page, no skipped levels. A heading is not a font size — do not use `<h3>` because you wanted 24px. | 1.3.1 |
| Every input labelled | Visible `<label for>`. Placeholder is not a label. | 3.3.2 |
| Errors identified in text | The message says what is wrong and what to do. `aria-invalid` + `aria-describedby`. | 3.3.1 |
| Colour never alone | Every status, error and presence indicator carries an icon or a word too. | 1.4.1 |
| Keyboard reachable | Every action works without a mouse, in a sensible order, with no traps. Test the RSVP flow and the mobile menu with the Tab key only. | 2.1.1 |
| Skip link | First focusable element: "Skip to content" → `#main`. Visually hidden until focused. | 2.4.1 |
| Target size ≥ 24×24 | We hold **44×44**, well above the AA floor. `u-tap` gives it to icon buttons without changing their look. | 2.5.8 |
| Focus not obscured | The sticky header must not cover a focused element. Set `scroll-margin-top` equal to the header height on focusable targets. **New in 2.2 — easy to miss with a sticky header.** | 2.4.11 |
| Consistent help | The Discord link sits in the same place in the footer on every page. | 3.2.6 |
| No drag-only actions | Nothing in Phase 1 requires dragging. Keep it that way. | 2.5.7 |
| Accessible auth | Discord OAuth carries the authentication; we add no puzzle, no CAPTCHA. | 3.3.8 |
| Images | Real `alt` on meaningful images. `alt=""` on decoration. The mark in the header is decorative if the wordmark text is beside it — do not announce it twice. | 1.1.1 |
| Zoom to 200% | No horizontal scroll, nothing clipped, at 320px equivalent. Use relative units; the type scale is in `rem`. | 1.4.4 / 1.4.10 |
| Live regions | The RSVP confirmation announces via `role="status"`. Do not use `role="alert"` for success. | 4.1.3 |

## Things specific to a dark interface

- **Do not use pure white `#fff` for body text.** `--color-ink` is `#edeaf4`
  deliberately: maximum-contrast white on near-black causes halation, which is
  genuinely painful for readers with astigmatism.
- **Do not go below 16px for prose.** Small light-on-dark text loses legibility
  much faster than dark-on-light does. `text-sm` is for labels and meta, not
  paragraphs.
- **Do not fade disabled controls with opacity.** Opacity over three different
  grounds produces three different contrast ratios, one of which will fail.
  Use `--color-ink-disabled`, which is verified.

## Verification, in order of cost

1. `node tools/check-contrast.mjs` — must print **43/43**. Runs in CI (TWO-22).
2. Keyboard-only pass on each screen: Tab through everything, activate
   everything, confirm the focus ring is always visible and never covered by
   the sticky header.
3. axe or Lighthouse accessibility audit in the CI gate — **0 violations**, not
   "a good score".
4. Zoom to 200% and to 320px width. Nothing clipped, no horizontal scroll.
5. A screen reader pass on the two flows that matter: joining, and RSVP'ing.

Items 1–4 are automatable and belong in CI. Item 5 is manual and belongs in
the launch checklist (TWO-35).

## Known gaps I am accepting, with reasons

- **No light mode.** Theme switching is out of Phase 1 scope. `color-scheme:
  dark` is declared so the OS renders native controls correctly. Users who need
  light specifically are served by OS-level and browser-level inversion, which
  works because we use no baked-in dark imagery.
- **No high-contrast-mode-specific stylesheet.** Forced-colors mode works
  acceptably because we use borders rather than shadows and never convey state
  by background colour alone. Worth a real check at TWO-35.
