# Real content: what we have, what we don't, what we must never show

**Read this before building the landing page (TWO-28).** All four decisions
below were made by the CPO on TOG-38 (2026-08-25). One hard constraint on the
build follows.

Every number here comes from the TWO-13 audit
(`two-bot/audit/summary.json`, collected 2026-08-19). Nothing is estimated.

---

## 1. The situation

| Measure | Value |
|---|---|
| Total members | 107 (84 human, 23 bots) |
| Online at audit time | 27 |
| Human messages, last 90 days | **15** |
| Human messages, last 30 days | **1** |
| New members, last 30 days | **0** |
| New members, last 90 days | 1 |
| Members stuck at the rules screen | 31 of 84 |
| Channels visible to a newcomer | 27 of 112 |
| Channels the audit marked `archive` | 84 |
| Scheduled events | 0 |

The server is quiet. That is the honest description, and the design has to be
built for it rather than around it.

## 2. The hard constraint

> **TWO-28 asks for "real screenshots from our own server". There are none
> worth showing.**

A screenshot of `#general` shows ten messages spread across three months. A
Discord activity widget shows an empty room. Either one actively damages the
first impression — worse than showing nothing, because a newcomer reads it as
*"this place is dead"* rather than *"this place is small"*, and those are very
different decisions to make about joining.

I am not going to substitute a stock photo or a mockup of a busier server, and
the brief rightly forbids both. So the landing page needs a different spine.

## 3. What we can honestly put on the page

All of this is real and verifiable:

**The story.** Founded 1998. 18+. A private clan that opened its doors. This is
the strongest asset we have and it costs nothing to tell.

**The ladder.** The clan has a real membership path, and the roles prove people
walk it. **Internal working data — never ships as a table.** The ranks are
cumulative (a Legend still holds Member and Prospect), so these counts do not
sum to 84 and must never be printed as a column a reader could add up:

| Rank | People holding it (cumulative) |
|---|---|
| Prospect | 51 |
| Member | 41 |
| Soldier | 17 |
| Veteran | 7 |
| Legend | 6 |
| Founders | 5 |

**Shipping rule: the ladder ships as a narrative sequence of names, never as
counts.** `docs/COPY.md` already does this right — "You start as a Prospect…
Soldier, Veteran, Legend" — and that prose form is the only one allowed on the
page. This is the single best piece of content we have. It answers *"what does
joining actually mean here?"* with something specific that a generic Discord
cannot say. It also sets an expectation — you start as a Prospect, you become a
Member — which is exactly the "you will not be anonymous" promise made concrete.

**Where people are.** North America 28, Asia 3, Europe 1, South America 1,
Oceania 1. Useful for the honest line *"mostly North America, mostly evenings"*
— which tells someone in the UK what they are signing up for.

**Platforms.** PC 27, Xbox 14, Switch 10, Mobile 8, PlayStation 6.

**How we play.** The voice rooms are named `Duos`, `Trios`, `Quads`, `Squads`.
That is a real detail about a group that plays in small squads, and it is more
convincing than any adjective.

**The counts.** `{human_member_count}` members, `{online_count}` online — both
bound to the live bot payload, never a literal. See the decision below.

## 4. What the site must never show

Hard rules for the build. These are not preferences.

- **No message counts, post counts, or "last active" timestamps.** Anywhere.
- **No embedded Discord widget or live chat preview.** It renders an empty room.
- **No channel list with activity indicators.**
- **No growth or momentum framing** — "X joined this week", "growing fast",
  trend arrows, sparklines. It was zero last month.
- **No leaderboard of top chatters.** (Also out of Phase 1 scope.)
- **No screenshots of chat** until there is chat worth screenshotting. Revisit
  after the TWO-14 reorg lands and TWO-5 shows real activity.
- **No counter that can render `0`** without a designed sentence next to it
  explaining what zero means. See the empty states in `docs/COMPONENTS.md`.

## 5. What I need from the bot (TWO-23)

So the landing page never has to compute or guess:

| Field | Notes |
|---|---|
| `human_member_count` | **Humans only.** Publishing 107 when 23 are bots is a lie we would get caught in. |
| `online_count` | Humans only, same reason. |
| `counts_updated_at` | Timestamp, so the page can say how fresh the number is. |
| `rank_counts` | Map of rank name → headcount, for the ladder. Rank names come from Discord roles; the bot owns that mapping, not the website. |
| `next_event` | Nullable. The empty state depends on this being explicitly null rather than missing. |

**Cache TTL:** 60 seconds is fine, and the page must render from cache without
ever waiting on Discord. If the cache is stale or the bot is unreachable, the
page shows the last known number with its timestamp — it does not show `0`, and
it does not show a spinner. The degraded state is specified in
`docs/COMPONENTS.md`.

---

## Decision 1 — do we publish the member count? **Decided: yes — 84, framed, humans only.**

Approved as recommended by the CPO (TOG-38, 2026-08-25), including the copy.
Hiding it is worse. A community site with no numbers reads as a community with
something to hide, and anyone who joins finds out in four seconds anyway.

Framed correctly, 84 is an asset, not an apology. The copy is:

> **84 members. That is on purpose.**
> Small enough that people know your name by the second time you show up.

That turns our weakest number into the actual pitch. It must not publish
*unframed* next to a big empty page, where the reader supplies their own
interpretation.

**Humans only, and this is a hard rule, not a preference.** Publishing 107
when 23 are bots is a claim we would get caught making. The bot contract in
§5 below is the acceptance condition, not a note.

`online_count` is agreed as a **presence dot** beside the member count, never
a headline figure on its own.

## Decision 2 — the landing page needs one scheduled event. **Decided: yes — and it is a launch gate, not a build gate.**

Right now there are **zero scheduled events**. The events calendar is the only
place on this site where a visitor can see a reason to show up at a specific
time, and it is empty. This cannot be fixed in CSS: an empty calendar cannot
convert anyone even with a well-designed empty state.

**TOG-38 does not wait for it, and the build does not wait for it.** One
recurring event must exist before the site is public — tracked on its own
card (TOG-495), which blocks launch, not the build.

## Decision 3 — which games do we actually play? **Decided: (b) — genres and platforms at launch, admin-editable override later.**

Approved as recommended. The genre roles are real and self-maintaining:
Shooters (27), Survival (11), Horror (6); PC (27), Xbox (14), Switch (10),
Mobile (8), PlayStation (6) — all verified. The title-specific roles
(Pokémon, Retro Games, League of Legends, and others) sit at 0 — held by
nobody. We ship what is true and stays true without a maintainer; a current
title list becomes an admin-editable override later (TOG-33).

## Decision 4 — permission for member content. **Decided: stance approved, unchanged.**

No member names, clips or likenesses outside a member's own profile until
consent is explicit and recorded — named list, what they agreed to, in
writing. Nothing in the current design depends on it, which is the right
place to be.
