# Real content: what we have, what we don't, what we must never show

**Read this before building the landing page (TWO-28).** It contains two
decisions the CEO needs to make and one hard constraint on the build.

Every number here comes from the TWO-13 audit
(`two-bot/audit/summary.json`, collected 2026-08-19). Nothing is estimated.

---

## 1. The situation

| Measure | Value |
|---|---|
| Total members | 107 (84 human, 23 bots) |
| Online at audit time | 26 |
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
walk it:

| Rank | People holding it |
|---|---|
| Prospect | 51 |
| Member | 41 |
| Soldier | 17 |
| Veteran | 7 |
| Legend | 6 |
| Founders | 5 |

This is the single best piece of content we have. It answers *"what does
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

**The counts.** 84 members, N online. See the decision below.

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

## Decision 1 — do we publish the member count?

**My recommendation: yes, publish 84, and frame it.**

Hiding it is worse. A community site with no numbers reads as a community with
something to hide, and anyone who joins finds out in four seconds anyway.

Framed correctly, 84 is an asset, not an apology. The copy I have drafted is:

> **84 members. That is on purpose.**
> Small enough that people know your name by the second time you show up.

That turns our weakest number into the actual pitch. What we must not do is
publish it *unframed* next to a big empty page, where the reader supplies their
own interpretation.

The number I would **not** publish is `online_count` on its own — at 04:00 it
is a small number with no story attached. Recommend we show online only as a
presence dot beside the member count, not as a headline figure.

## Decision 2 — the landing page needs one scheduled event

Right now there are **zero scheduled events**. The events calendar is the only
place on this site where a visitor can see a reason to show up at a specific
time, and it is empty.

The empty state is designed and it does not look abandoned — but an empty
calendar cannot convert anyone. A visitor who reads "nothing scheduled yet"
has no reason to come back.

**This is not a design problem and I cannot fix it in CSS.** Before launch we
need **one recurring thing on the calendar** — a weekly game night, anything
with a day and a time on it. One repeating event turns the calendar from a
disappointment into the reason the site exists.

Who owns that decision and by when? It should block launch (TWO-35), not the
build.

## Decision 3 — which games do we actually play?

The role data tells me the **genres** people picked: Shooters (27), Survival
(11), Horror (6). It also shows game-specific roles that **nobody currently
holds**: Rocket League, War Thunder, Fall Guys, Counter-Strike, League of
Legends, Pokémon, Retro Games, Tabletop.

So I know the genres are real and the specific titles are stale.

TWO-28 asks for "which games we actually play". I am not going to invent a
list, and I am not going to print a stale one. I need either:

- a) a current list of titles from you or the staff, which I will treat as
  editorial content the moderator admin can edit (TWO-33); or
- b) agreement that we show **genres and platforms** instead, which is real
  data from the bot and stays true without anyone maintaining it.

**My recommendation is (b) for launch, (a) as an admin-editable override**, so
the page is honest on day one and can get more specific whenever someone has
five minutes to fill it in.

## Decision 4 — permission for member content

We have permission from **nobody** so far. The brief is clear that clips,
names and likenesses need consent, and I have not designed anything that
depends on them.

When there is real content worth showing, the ask needs to be explicit and
recorded — a message in the server, a named list of who said yes, and what
they said yes to. Until that exists, the site shows no member names outside a
member's own profile page, which they control.
