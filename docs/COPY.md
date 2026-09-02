# Copy direction and drafted microcopy

**Status: decided.** The CPO signed off on TOG-38 (2026-08-25) and read this
document in full. All four open questions below are answered — see "Decided"
at the bottom.

---

## The voice

TWO is a group of adults who have been playing together since 1998. Write the
way one of them would talk to someone at the door. Dry, direct, a bit
understated, never selling.

### Rules

1. **Say the true thing.** We are small and quiet. Copy that pretends otherwise
   gets found out in four seconds and costs us the person.
2. **No hype vocabulary.** Banned: level up, unleash, epic, next-level, elevate,
   journey, ecosystem, seamless, vibrant community, welcome to the future of.
3. **No exclamation marks.** Not one on the whole site.
4. **No emoji in headings.** Emoji is fine in Discord. It is not fine in an
   `<h1>`.
5. **Second person, active voice.** "You'll get a role" not "roles are
   assigned".
6. **Short sentences.** If a sentence has two commas, it is probably two
   sentences.
7. **Never call it a "journey" or an "experience".** It is a Discord server
   where people play games.
8. **The test:** if you could swap two nouns and put the sentence on a SaaS
   pricing page, delete it and write it again.

### Two examples of the difference

| Slop | Ours |
|---|---|
| Level up your gaming experience with an epic community 🚀 | A clan that has been playing together since 1998. |
| Join thousands of passionate gamers today! | 84 members. That is on purpose. |
| Unlock exclusive perks and rewards | You start as a Prospect. Stick around and that changes. |
| We're building an inclusive, vibrant community | 18+. Mostly North America. Mostly evenings. |
| Oops! Something went wrong 😅 | That didn't work. Try again in a minute. |

---

## Landing page

### Hero

> # Since 1998.
> **Together We Own is a gaming clan that spent most of its life private. We
> opened the doors.**
>
> 18+, mostly North America, mostly evenings. Small enough that people know
> your name by the second time you show up.
>
> `[ Join the Discord ]`
>
> _{human_member_count} members · {online_count} online_

Notes for the build:
- The `<h1>` is "Since 1998." — two words at `text-6xl u-display` on desktop,
  `text-3xl` on mobile. It fits on one line at 390px, which is what keeps the
  join button above the fold.
- The bold line below is `text-lg`, not a heading.
- The counts sit **below** the button, in `text-sm text-ink-muted`. They support
  the pitch; they are not the pitch. Both fields are bound to the bot payload
  (TOG-23) — `human_member_count` and `online_count`, never a hardcoded
  literal. If the bot is unreachable this line is omitted entirely — see the
  degraded state in `docs/COMPONENTS.md`.

### The "what joining means" section

> ## You start as a Prospect
>
> Everyone does. Show up a few times, play some games, and you become a Member.
> After that there is a ladder that goes Soldier, Veteran, Legend — some of the
> people on it have been here since the clan was on a forum.
>
> There is no application and no interview. You just turn up.

This is the strongest section on the page. It answers "what actually happens if
I click join" with something specific and true.

### The "how we play" section

> ## Squads, not raids
>
> The voice rooms are Duos, Trios, Quads and Squads, which tells you most of
> what you need to know. Shooters mostly, some survival, some horror when
> somebody talks the rest of us into it.
>
> PC, Xbox, PlayStation, Switch. Nobody cares which.

Per Decision 3 in `docs/CONTENT.md` (genres and platforms at launch), this
version uses only genres and platforms, which are real and self-maintaining.

### The honest section

> ## We are small, and we are not pretending otherwise
>
> Eighty-odd people. Some nights the lobby is busy and some nights it is three
> of us and a bad idea. If you want a server with a thousand people talking at
> once, there are plenty and you should go there.
>
> If you want somewhere people notice you came back, this is that.

I want to argue for keeping this one. It is the section that makes everything
else on the page credible, and it disqualifies exactly the visitors who would
have left anyway.

### Footer CTA

> **The door is open.**
> `[ Join the Discord ]`

---

## Buttons and controls

| Where | Copy |
|---|---|
| Primary CTA | **Join the Discord** (never "Get started", never "Sign up") |
| Login | **Log in with Discord** |
| Logging in | **Taking you to Discord…** |
| RSVP | **I'm in** |
| RSVP'd | **You're in** (with a check, not a colour change alone) |
| Cancel RSVP | **Can't make it** |
| Save profile | **Save** / loading: **Saving…** |
| Back to safety | **Back to the front page** |

---

## Empty states

| Screen | Copy |
|---|---|
| Events, none scheduled | **Nothing on the calendar yet.** Game nights get posted here first. Join the Discord and you'll see them before they land on this page. |
| Events, none upcoming | **Nothing scheduled right now.** The last one was {relative date}. They usually go up about a week ahead. |
| Profile, no RSVPs (own) | **You haven't RSVP'd to anything yet.** When you do, it shows up here. |
| Profile, no RSVPs (other) | **{Name} hasn't RSVP'd to an event yet.** |
| Admin, no events | **No events yet.** |

---

## Errors

| Situation | Copy |
|---|---|
| 404 | **That page isn't here.** It might have been renamed, or the link might be old. |
| 500 | **Something broke on our end.** Not your fault. Try again in a minute. |
| OAuth denied by user | **You cancelled the Discord login.** No harm done — you can try again whenever. |
| OAuth failed | **Discord didn't let us finish logging you in.** Give it a minute and try again. |
| Not in the server | **You'll need to be in the TWO Discord first.** Join the server, then come back and log in. `[ Join the Discord ]` |
| Events failed to load | **Couldn't load the events.** Refresh in a moment and it should be back. |
| RSVP failed | **That RSVP didn't save.** Try once more. |
| Event full | **This one's full.** Cap is {n}. |
| Form validation, generic | **Check the highlighted field{s} and try again.** |
| Rate limited | **Too many tries.** Give it a minute. |

Rules: no "Oops". No "Whoops". No apologising twice. Every message names the
next action.

---

## Decided

CPO sign-off, TOG-38 (2026-08-25) — read in full, cleared for build:

1. **"Since 1998." as the `<h1>`: yes.** Verified at source
   (`two-bot/audit/raw/guild.json:5`) and it is the one claim a 40,000-member
   server cannot answer. Stand behind it.
2. **The honest section stays, deliberately.** It is the section that makes
   the other claims believable; cutting it leaves a site that sounds like
   every other site. Nothing here is cut.
3. **"18+" stays in the hero.** It is a real filter and filtering correctly
   is the strategy.
4. **Voice rules: agreed, unchanged.** No "Oops", every message names the
   next action.
