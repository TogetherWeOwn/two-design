# Brand direction — TWO

**Status: needs CEO review.** There is one open decision at the bottom that I
cannot make on my own, because it means partly overruling a rule you set.

---

## 1. What TWO actually is

Straight from the server's own description, not from a positioning workshop:

> Together We Own is an 18+ gaming community originally a private clan,
> established in **1998**. We have opened our doors with the goal of finding new
> like-minded people to chill, game, and hang out with.

Three facts in there, and they are the whole brand:

- **1998.** Twenty-eight years. Older than Discord, older than Steam, older
  than most of the people in a typical gaming server.
- **18+.** Adults. People with jobs, partners, kids, and a couple of hours
  after ten at night.
- **Was private, now open.** This is a clan letting strangers in for the first
  time. That is a genuinely unusual thing and it should feel like an invitation
  to something that already exists, not a launch.

## 2. The strategic problem, said plainly

We are a **107-member server that got one new member in the last 90 days**.

We cannot win a first impression on scale, energy or activity. Every generic
gaming Discord landing page competes on exactly those, and against a
40,000-member server we lose that fight on the first screen.

What we have that they structurally cannot copy is **age and smallness**:
people who have been playing together since 1998, and a room small enough that
you will be recognised on your second visit.

So the promise of this site is not *"the biggest community"*. It is closer to:

> **You will not be anonymous here, and nobody is fourteen.**

Everything visual below is downstream of that one sentence.

## 3. The visual position

**We are a clubhouse, not a launch.**

| We look like | We do not look like |
|---|---|
| A door with a plaque on it | A product launch |
| A scoreboard, a jersey, a patch | A Twitch overlay |
| A room that has been lived in | A room that opened yesterday |
| Adults being dry about it | A brand being excited at you |

Practically:

- **No neon.** Neon-RGB is the aesthetic of new servers competing on energy. We
  are the opposite pitch.
- **No hype vocabulary.** No "level up", no "epic", no "unleash", no rockets.
  If a sentence could appear on a SaaS pricing page with two nouns swapped, it
  is wrong. See `docs/COPY.md`.
- **No stock imagery, ever.** No people in headsets, no controller clip art, no
  AI-generated art. We have a real logo and a real server; that is the image
  library.
- **Density is calm.** Generous spacing, few things per screen, one action per
  screen that matters.

## 4. The mark

We already have a good one. `assets/brand/two-icon-256.png` — a white chamfered
shield with a central column and curved side walls.

It is genuinely strong: **flat, geometric, symmetrical, and it works as a
single-colour silhouette**. That is a better mark than most communities have
and we are not touching it.

Rules:

- Use it **white on a dark ground** as the default. That is its best form.
- Minimum size **24px**; below that the inner counters close up and it turns
  into a blob.
- Clear space around it equal to the width of its central column.
- Never recolour it, never outline it, never add a glow, never rotate it,
  never put it on a busy photograph.
- The full `TOGETHER WE OWN` lockup (`assets/brand/two-splash-1024.png`) is for
  social cards and the OG image. On the site itself, the mark plus real
  typography, not the lockup image — a bitmap wordmark in a header is blurry on
  every retina screen and unselectable by a screen reader.

**The corner treatment of the mark is where the 4px radius rule comes from.**
The shield is chamfered and hard-edged, so the interface is too. This is the
single decision that most stops the site looking like a template.

## 5. Colour

I sampled these from **our own splash art**, not from a palette generator:

| Sample point | Value |
|---|---|
| Left edge | `#160150` deep violet |
| Middle | `#670143` plum |
| Right edge | `#C80154` crimson |

The interesting property: **the green channel is at zero across the entire
image**. TWO's brand lives on a pure red-to-blue axis. That is unusual and
ownable, and the palette in `tokens/two.css` keeps it — even the greys are
violet-cast rather than neutral.

The system takes the two ends and drops the middle:

- **Deep violet** `#160750` — a ground tint. One band per page.
- **Crimson** `#C80154` — the join action. Once per screen.
- **Near-white** `#EDEAF4` — everything you read.

Green (`#3BD07A`) appears only to mean *a person is online*, matching Discord's
own convention, because our members already read green that way.

## 6. Typography

**Archivo**, one family, self-hosted, OFL licensed, one file.

Why this one:

- It carries a **width axis as well as a weight axis**, so the expanded
  headline treatment echoes the wide `TOGETHER WE OWN` lettering in the
  existing lockup — without shipping a second typeface.
- It is a workhorse grotesque, so 14px table text stays readable, which a
  "gamer font" would not.
- It is **not Inter**. Inter is the default of every AI-generated landing page
  and half the SaaS internet. Using it would undo a lot of the work above.

We deliberately do **not** recreate the angular techno lettering from the
lockup in HTML. That style is a 2010s esports convention and it fights the
"1998, adults, been here a while" position. The lockup keeps it; the site does
not.

## 7. Imagery — an honest problem

The brief says to use real screenshots from our own Discord.

**I looked. There is nothing usable to screenshot.** From the TWO-13 audit:
15 human messages across the whole server in 90 days, 1 in the last 30, and 84
of 112 channels are dead. A screenshot of `#general` would actively damage the
first impression.

This is a real blocker on the landing page (TWO-28), not a design preference. I
have written up the options in **`docs/CONTENT.md`** and there is a decision
for you there too. Short version: we build the landing page on the 1998 story,
the rank ladder, and one scheduled event — and we do not show chat.

---

## The open decision — I need your call

**Our logo is a purple-to-magenta gradient.** It is exactly the thing you
banned: *"no purple-gradient hero."*

I do not think you were wrong, and I do not think the logo is wrong either.
What you banned is the generic AI-slop artefact — the purple→blue gradient
wash behind a hero headline that appears on ten thousand identical pages. Our
gradient is not that; it is a brand asset we have owned for years and members
recognise.

**What I have built, and what I recommend:**

1. **The logo keeps its gradient.** Where the lockup appears as a logo — social
   cards, the OG image, the favicon — it is untouched. It is our identity.
2. **The site uses no gradient as a surface.** No gradient hero, no gradient
   buttons, no gradient cards. The hero is a flat deep-violet band.
3. **The gradient becomes two flat colours** — violet ground, crimson action.
   Literally the two ends of our own ramp, stated as colours instead of a wash.
4. **One texture survives**, and I want to name it explicitly rather than
   sneak it past you: the splash art has diagonal hairline ruling. I have kept
   it as `u-hatch`, a 1px 45° pattern at very low contrast, used **only as the
   ground of empty states** — the "nothing is scheduled yet" panel. It makes an
   empty area read as *reserved on purpose* rather than *broken*. Budget: one
   hatched area per screen. If you would rather have nothing, say so and I will
   delete the utility; the empty states then use a plain bordered panel and
   lose a little.

If you would rather I strip the gradient from the logo usage too, that is your
call to make and I will follow it — but I would be spending brand equity to buy
consistency, and I do not think that trade is worth it.

**What I need from you:**

- Approve or reject points 1–4 above.
- The `docs/CONTENT.md` decision about what the landing page is built on, since
  we have no usable screenshots.
- A read of `docs/COPY.md` before any of it goes public.
