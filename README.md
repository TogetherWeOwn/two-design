# TWO — design system

The whole system in one page. If you only read one file, read this one.

## Licences and reuse

The [licence scope](LICENSE) separates the reusable system from its brand
and third-party assets:

| Material | Terms |
|---|---|
| First-party code, configuration and design tokens, including preview HTML/CSS and documentation code examples | [MIT](LICENSES/MIT.txt) |
| First-party documentation prose in this README, `CONTRIBUTING.md` and `docs/` | [CC-BY-4.0](LICENSES/CC-BY-4.0.txt); attribute TogetherWeOwn contributors, link the source and licence, and indicate changes |
| TWO / Together We Own names, logos and brand-mark artwork, including `assets/brand/two-icon-256.png` and `assets/brand/two-splash-1024.png` | [All rights reserved](assets/brand/NOTICE.md); excluded from both open licences, with no trademark permission granted |
| Third-party Archivo fonts in `assets/fonts/` | [SIL OFL 1.1](assets/fonts/Archivo-OFL.txt), with their original copyright notice; not relicensed as first-party work |

A mark remains reserved when displayed in the preview or documentation.
Other third-party material retains its own notices and terms. See [LICENSE](LICENSE)
for the exact boundary and attribution details; retain applicable notices
when redistributing code, documentation or fonts.

This licensing change does not make the repository public or publish a
package. `package.json` retains `"private": true`; public GitHub access is
not npm publication.

## Install

These commands target TWO's own site. For another project, reuse the code and
tokens under MIT, preserve the Archivo OFL notice, and substitute your own
brand assets unless you have separate permission to use TWO's marks.

```bash
cp tokens/two.css                 ../two-web/resources/css/two.css
cp assets/fonts/*.woff2           ../two-web/public/fonts/
cp assets/fonts/Archivo-OFL.txt   ../two-web/public/fonts/
cp assets/brand/*                 ../two-web/public/brand/
```

`resources/css/app.css` becomes:

```css
@import 'tailwindcss';
@import './two.css';

@source '../**/*.blade.php';
@source '../**/*.js';
```

Delete the `@theme { --font-sans: 'Instrument Sans' ... }` block the Laravel
starter shipped with. It is replaced.

In `<head>`, before the Vite tags:

```blade
<link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
```

Verify before you open a PR:

```bash
node tools/check-contrast.mjs      # must print 43/43
```

## The idea, in four sentences

TWO is a clan founded in **1998** that was private for most of its life and has
opened its doors. It is **18+**. It is **small** — 84 people, not 84,000. Those
three facts are the entire brand, because they are the only things we have that
a big shiny Discord server cannot copy.

So the site does not compete on energy. It competes on **being real and being
old**. Every design decision below follows from that.

## What that means concretely

| Decision | Because |
|---|---|
| Dark, near-black violet ground | People arrive from Discord, which is dark. A white flash is a jarring handoff. And a dark page makes a small amount of content read as *composed* rather than *sparse* — which matters enormously to us (see `docs/CONTENT.md`). |
| Crimson used **once per screen** | It is the join button. If crimson appears twice, the eye has to choose, and the funnel is the whole point of this site. |
| Corners are 4px, never 12px | Soft corners and pill buttons are the signature of every SaaS template. Our mark is a chamfered shield. Hard corners read as a badge, not a startup. |
| Borders instead of shadows | On a near-black ground a shadow is invisible, so teams make it huge, and that is why dark SaaS themes look muddy. Surfaces separate with a 1px line and a lightness step. |
| One font, two widths | Archivo carries a width axis, so `.u-display` gives us expanded signage lettering that echoes the "TOGETHER WE OWN" lockup — with no second font file. |
| Errors are burnt orange, not red | The primary button is crimson. A red error beside it is indistinguishable at 14px and worse under deuteranopia. |
| No gradients as surfaces | Covered in `docs/BRAND.md` — this one needed a real argument, because TWO's own logo *is* a gradient. |

## The rules that get enforced in review

1. **No literal values in templates.** No `#c80154`, no `text-[13px]`, no
   `p-[18px]`. If the value you need is not a token, the system is missing it —
   say so, do not invent it.
2. **Nothing is rounder than `rounded-lg` (8px)** except an avatar, which is
   `rounded-full`.
3. **`--color-line` never borders an interactive control.** Inputs, checkboxes
   and secondary buttons use `--color-line-strong`, which is the one that
   clears 3:1. Getting this backwards is the most likely accessibility bug in
   the build.
4. **Every interactive thing has a 44×44px hit area.** Icon-only buttons use
   `u-tap` to get it without growing visually.
5. **Never remove a focus outline.** `:focus-visible` is styled globally in
   `tokens/two.css`; you should not need to touch focus at all.
6. **Colour never carries meaning alone.** Every error, every status, every
   presence dot also has an icon or a word.
7. **Empty states are designed, not omitted.** See `docs/COMPONENTS.md`. An
   unbuilt empty state is an unfinished screen and I will not sign it off.

## Files

| Path | What |
|---|---|
| `tokens/two.css` | **The design system.** Tailwind v4 `@theme` + base + utilities. |
| `tools/check-contrast.mjs` | Asserts all 43 colour pairings. Zero deps. Wire into CI (TWO-22). |
| `preview/index.html` | Every token and every component state, rendered. Open it in a browser — no build step. This is what I review builds against. |
| `docs/BRAND.md` | Brand direction. **Needs CEO sign-off** — contains one open decision. |
| `docs/COMPONENTS.md` | Every component, every state, including empty and error. |
| `docs/ACCESSIBILITY.md` | The AA contract and how it is verified. |
| `docs/COPY.md` | Voice, and drafted microcopy. **Needs CEO sign-off before it goes public.** |
| `docs/CONTENT.md` | What real content we actually have, and what the landing page must never show. Read this before building TWO-28. |
| `assets/` | The real logo, the real splash, the font, the licence. |

## Who to ask

Layout, spacing, states, copy, anything visual — Product Designer. I sign off
every screen against its spec before it merges; that is a hard gate, not a
courtesy. If a spec is expensive, tell me the cheaper version and I will make
the call.
