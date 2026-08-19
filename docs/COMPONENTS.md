# Components — every state

Every component in Phase 1, with **default, hover, focus, active, disabled,
loading, empty and error**. A state that says "n/a" says why.

Classes below are Tailwind utilities built from `tokens/two.css`. They are the
actual implementation, not pseudocode — `preview/index.html` renders all of it
so you can see each state before you build it.

**The gate:** a screen is not signed off until every state listed for every
component on it exists and I have seen it. Empty states included. Especially
empty states.

---

## Global rules

| Rule | Value |
|---|---|
| Focus | `outline: 2px solid var(--color-focus)`, `outline-offset: 2px`. Global, on `:focus-visible`. Do not restyle per component. |
| Minimum hit area | 44 × 44 px. Use `u-tap` on icon-only controls. |
| Transition | `transition-colors duration-fast ease-out-quick`. Colour only. Never animate size or position on hover. |
| Disabled | `disabled:opacity-100` — do **not** fade controls out. Use `text-ink-disabled` + `border-line` + `cursor-not-allowed`. Opacity fading makes text fail contrast unpredictably against three different grounds. |
| Loading | The control keeps its exact box. Never let a spinner change layout — that is a CLS failure and we have a 0.1 budget. |

---

## 1. Button

Three variants. There is no fourth, and a "ghost with a border" is one of the
three already.

### 1.1 Primary — the join button

There is **one primary button per screen**. It is crimson. If you need two,
one of them is a secondary.

```html
<a href="{{ $inviteUrl }}"
   class="inline-flex items-center justify-center gap-2 min-h-11 px-6
          rounded-md bg-brand text-on-brand font-semibold
          hover:bg-brand-hover active:bg-brand-active
          transition-colors duration-fast ease-out-quick">
  Join the Discord
</a>
```

| State | Treatment |
|---|---|
| Default | `bg-brand` `text-on-brand`, weight 600, `min-h-11` (44px) |
| Hover | `bg-brand-hover` — lighter, so it reads as "closer" |
| Focus | Global ring. Verified at 5.15:1 against the crimson fill. |
| Active | `bg-brand-active` — darker, pressed |
| Disabled | `bg-surface` `text-ink-disabled` `border border-line` `cursor-not-allowed`. It loses the crimson entirely: a greyed-out crimson button still reads as the primary action and people keep clicking it. |
| Loading | Label swaps to the progress verb ("Saving…"), a 16px spinner takes the leading icon slot, `aria-busy="true"`, `disabled`. **Box size does not change** — reserve the icon slot in the default state. |
| Empty | n/a |
| Error | Buttons do not show errors. The error goes in the form or the toast; the button returns to default and stays enabled so the person can retry. |

### 1.2 Secondary

```html
<button class="inline-flex items-center justify-center gap-2 min-h-11 px-5
               rounded-md bg-transparent text-ink border border-line-strong
               hover:bg-raised hover:border-ink-muted
               active:bg-surface
               transition-colors duration-fast ease-out-quick">
```

Note `border-line-strong`, not `border-line`. This is a control boundary and it
must clear 3:1 (WCAG 1.4.11). Using `border-line` here is the most likely
accessibility bug in this build.

Disabled: `text-ink-disabled border-line cursor-not-allowed`.

### 1.3 Quiet

Text-only, for tertiary actions and destructive-ish ones like cancelling an
RSVP. `text-ink-muted hover:text-ink hover:bg-raised rounded-md min-h-11 px-3`.

No red destructive variant. Nothing in Phase 1 destroys anything a person
cannot immediately redo, and a red button would collide with the crimson CTA.

---

## 2. Link

Inline, in prose: `u-link` — `text-brand-ink` **with an underline**. The
underline is not optional; colour alone is not a distinguishing mark (WCAG
1.4.1). Hover thickens the underline and shifts to `text-ink`.

Standalone navigation links are not underlined, because their position and
grouping already distinguish them.

---

## 3. Text input / textarea / select

```html
<div>
  <label for="x" class="block text-sm font-medium text-ink mb-1.5">Label</label>
  <input id="x"
         class="w-full min-h-11 px-3 rounded-md bg-canvas text-ink
                border border-line-strong
                placeholder:text-ink-muted
                hover:border-ink-muted
                transition-colors duration-fast ease-out-quick">
  <p id="x-help" class="mt-1.5 text-sm text-ink-muted">Help text.</p>
</div>
```

| State | Treatment |
|---|---|
| Default | `bg-canvas` (recessed — darker than the card it sits on), `border-line-strong` |
| Hover | `border-ink-muted` |
| Focus | Global ring. Do **not** also change the border colour; two focus signals is noise. |
| Active/filled | Same as default. Filled state is carried by the value being there. |
| Disabled | `bg-surface text-ink-disabled border-line cursor-not-allowed`, and `readonly` where the value still matters to read. |
| Loading | Inputs do not load. The form's submit button does. |
| Empty | Placeholder in `text-ink-muted`. **Placeholder is never a substitute for a label** — every input has a visible `<label>`. |
| **Error** | `border-alert` + a message below in `text-alert` prefixed with an alert icon. Wire `aria-invalid="true"` and `aria-describedby` to the message id. The label stays `text-ink` — colouring the label too makes the error harder to read, not easier. |

Error message pattern — icon **and** words, never colour alone:

```html
<p id="x-error" class="mt-1.5 flex items-start gap-1.5 text-sm text-alert">
  <svg class="size-4 shrink-0 mt-0.5" aria-hidden="true"><!-- alert triangle --></svg>
  <span>Pick a date that hasn't happened yet.</span>
</p>
```

---

## 4. Checkbox and radio

20 × 20 px visual, inside a 44px-tall label row so the whole row is the target.
`rounded-sm` for checkbox, `rounded-full` for radio.

| State | Treatment |
|---|---|
| Unchecked | `bg-canvas border border-line-strong` |
| Checked | `bg-brand border-brand`, white check glyph |
| Hover | `border-ink-muted` (unchecked) / `bg-brand-hover` (checked) |
| Focus | Global ring on the input |
| Disabled | `bg-surface border-line`, glyph in `text-ink-disabled` |
| Error | Row gets an `text-alert` message beneath, same pattern as inputs |

---

## 5. Card

The workhorse. Events, member tiles, rank rows, everything.

```html
<article class="rounded-lg bg-surface border border-line p-5">
```

| State | Treatment |
|---|---|
| Default | `bg-surface border-line rounded-lg` |
| Hover (only if the whole card is a link) | `bg-raised border-line-strong`. Non-interactive cards do **not** react to hover — a card that highlights but cannot be clicked is a lie. |
| Focus | If the card is a link, put the anchor over the title and use `u-focus-ring` on the card via `:focus-within`. Never make a `<div>` focusable. |
| Active | `bg-surface` (returns to base — a pressed-in feel) |
| Disabled | Cards are not disabled. A card for something unavailable shows a badge saying why. |
| Loading | Skeleton: `bg-raised rounded-md` blocks at the exact heights of the real text lines. No shimmer animation. `aria-busy="true"` on the container and a visually hidden "Loading events". |
| Empty | See §8. |
| Error | See §9. |

**No shadow on cards.** Elevation comes from the border and the lightness step.

---

## 6. Badge / pill

`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium`

| Meaning | Classes |
|---|---|
| Neutral (rank, platform, genre) | `bg-raised text-ink-muted border border-line` |
| Brand (Prospect→Member callout) | `bg-brand-quiet text-brand-ink` |
| Online | `bg-online-quiet text-online` + a 6px `rounded-full bg-online` dot |
| Attention | `bg-alert-quiet text-alert` + alert icon |

`rounded-sm`, not `rounded-full`. Pill badges are the SaaS-template tell.

---

## 7. Live counter (landing page)

Renders the member count from the bot's cache. It has more states than anything
else on the site, because it is the one thing that can be wrong.

```html
<p class="u-numeric text-6xl u-display text-ink">84</p>
<p class="text-sm text-ink-muted">members · <span class="text-online">26 online</span></p>
```

| State | Treatment |
|---|---|
| Default | Number in `u-display u-numeric` at `text-6xl` desktop / `text-4xl` mobile. `u-numeric` is required — without tabular figures the number jumps width when it ticks. |
| Hover / active | n/a — not interactive |
| Focus | n/a |
| Disabled | n/a |
| Loading | **Server-render the last cached value. There is no loading state.** The page must never wait on the bot. If the value is genuinely unavailable at render, use the degraded state below. |
| **Stale** | Value renders normally plus `text-xs text-ink-muted`: "as of 14:20". Only shown when the cache is older than 10 minutes. |
| **Degraded** (bot unreachable, no cached value) | The whole counter block is **replaced**, not zeroed: the section shows the headline and the join button and omits the number entirely. Never render `0`. A zero here is the single most damaging thing this page can display. |
| Error | Same as degraded. A visitor never sees an error about our infrastructure. |

---

## 8. Empty states — designed first

**The most important components on this site.** A new community site is mostly
empty, and empty must read as *early*, not *abandoned*.

The pattern, everywhere:

```html
<div class="u-hatch rounded-lg border border-line p-8 text-center">
  <h3 class="text-lg font-semibold text-ink">{ what is not here }</h3>
  <p class="mx-auto mt-1.5 max-w-prose text-sm text-ink-muted">{ why, and what happens next }</p>
  <div class="mt-5">{ the one action }</div>
</div>
```

Three rules:

1. **Never the word "empty", "nothing", "no results" alone.** Say what happens
   next instead.
2. **Always exactly one action.** An empty state with no way out is a dead end.
3. **Never an illustration.** No empty-box graphic, no sad robot. The `u-hatch`
   ground does the work — it reads as *reserved*, which is the message.

Per screen:

### Events calendar, no events
> **Nothing on the calendar yet.**
> Game nights get posted here first. Join the Discord and you will see them
> before they land on this page.
> `[ Join the Discord ]`

This is the one the brief singles out, and the framing matters: the absence is
explained by "the Discord is where it happens first", which turns an empty
calendar into a reason to join rather than evidence that nobody plays.

### Events calendar, no *upcoming* events but past ones exist
> **Nothing scheduled right now.**
> The last one was { relative date }. They usually go up a week ahead.
> `[ See past events ]`

Never show an empty upcoming list when past events exist without saying so —
that reads far worse than it is.

### Profile, no events attended yet
> **You haven't RSVP'd to anything yet.**
> When you do, it shows up here.
> `[ Browse events ]`

Second person, and no scolding. It is not a failure to be new.

### Profile, viewing someone else with no activity
> **{Name} hasn't RSVP'd to an event yet.**
> No action. Do not invite a stranger to do something on someone else's behalf.

### Admin, no events created
> **No events yet.**
> `[ Create the first one ]`
> Filament's own empty state, restyled to these tokens. Do not rebuild it.

---

## 9. Error states

Three tiers. Use the smallest one that fits.

### Inline field error
§3 above. Next to the thing that is wrong.

### Section-level notice
For "this part of the page could not load", where the rest of the page is fine.

```html
<div role="status" class="rounded-lg border border-line bg-alert-quiet p-4
                          flex items-start gap-3">
  <svg class="size-5 shrink-0 text-alert" aria-hidden="true"><!-- alert --></svg>
  <div>
    <p class="text-sm font-medium text-ink">Couldn't load the events.</p>
    <p class="mt-0.5 text-sm text-ink-muted">Refresh in a moment and it should be back.</p>
  </div>
</div>
```

`role="status"` (polite), not `role="alert"` — this did not interrupt anything
the person was doing.

### Page-level failure (404, 500, OAuth denied)

Full-page, centred, `max-w-prose`. The mark at 48px, an `u-display` heading, one
sentence, one action back to somewhere real. No error codes in the heading —
put the code in `text-xs text-ink-muted` at the bottom for support.

Copy for each is in `docs/COPY.md`.

**Rule: an error message names what the person can do next.** "Something went
wrong" with no action is not an error state, it is a shrug.

---

## 10. Avatar

The only round thing in the system. `rounded-full`, sizes 24 / 32 / 40 / 64.

| State | Treatment |
|---|---|
| Default | Discord CDN image, `object-cover`, `bg-raised` behind it while it loads |
| Empty (no avatar) | Initials in `u-display` on `bg-raised`, `text-ink-muted`. **Never a generic person silhouette.** |
| Error (image 404s) | Falls back to the initials state via `onerror`. Never a broken-image icon. |
| Online | 10px `bg-online` dot, bottom-right, with a 2px `border-canvas` ring to separate it from the photo. The dot has an `aria-label`; presence is never colour-only. |

Always `width`/`height` attributes. An avatar without dimensions is a CLS bug.

---

## 11. Navigation

Header: `bg-canvas border-b border-line`, 64px tall, sticky.

Contents: the mark (24px) + "TOGETHER WE OWN" set in `u-display text-sm`, nav
links, and the join button on the right.

| State | Treatment |
|---|---|
| Link default | `text-ink-muted min-h-11 px-3 rounded-md` |
| Link hover | `text-ink bg-raised` |
| Link current | `text-ink` + a 2px `bg-brand` underline, **and** `aria-current="page"` |
| Focus | Global ring |
| Mobile | Below `md`: links collapse into a disclosure button; **the join button stays visible in the bar at all times.** It is the only thing on this site that must never be behind a menu. |

---

## 12. Responsive

Three breakpoints. Tailwind defaults, no custom ones.

| | Width | Layout |
|---|---|---|
| Mobile | 360–767 | Single column. `px-4` gutters. Content `max-w-full`. |
| Tablet | `md:` 768–1023 | Two columns where there is a list. `px-6`. |
| Desktop | `lg:` 1024+ | Content `max-w-6xl` centred, `px-8`. Prose blocks capped at `max-w-prose` — full-width body text is unreadable regardless of viewport. |

**360px is the floor and it is tested**, not 375. Mobile is the primary case:
most visitors arrive from a link in Discord on a phone.

### The one hard layout spec for the hero

On a **390px viewport the join button must be above the fold.** That means, at
mobile size: h1 at `text-3xl` (30px) over at most three lines, one line of
`text-base` supporting copy, then the button. If the headline copy grows past
three lines at 390px, the copy changes — not the type size.
