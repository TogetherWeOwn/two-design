# Contributing to two-design

The design system: colour, type, spacing, brand assets, and the checks that
keep them honest. **Zero dependencies, on purpose** — there is nothing to
install.

## Local setup, start to finish

Requires **Node 22 or newer** and nothing else.

```bash
git clone git@github.com:two-gaming/two-design.git
cd two-design
git config core.hooksPath .githooks    # do this once, see below
node tools/check-contrast.mjs          # must print 43/43
```

That is the whole setup.

The `core.hooksPath` line turns on the repo's own git hooks: they refuse a
direct push to `main`, and refuse to commit a `.env` or a private key. Git only
looks in `.githooks/` if you tell it to, and it will not tell you that you
forgot.

## The commands

| Command | What it does |
|---|---|
| `npm run check` | WCAG 2.2 AA contrast over every pairing. Must print `43/43`. |
| `npm run preview` | Rebuilds `preview/tokens.generated.css` from `tokens/two.css`. |
| `npm run verify` | Both of the above. Run it before you open a PR. |

## The two gates

CI runs the same two things you can run locally, and both block a merge:

1. **Contrast** — `tools/check-contrast.mjs` parses the hex values straight out
   of `tokens/two.css`. It keeps no copy of its own, so it cannot go stale. Any
   failing pairing exits non-zero.
2. **Coverage has not shrunk** — the number of asserted pairings is a floor,
   currently 43. Deleting a pairing to make a failure disappear still prints a
   green `PASS`, so the count is checked as well as the result.

Raising the floor when the system genuinely grows is expected. Lowering it is a
decision that gets said out loud in the PR.

Whole run is about 30 seconds.

## Branches

Nothing lands on `main` except through a pull request.

How strongly that is enforced depends on the org's GitHub plan, and it is worth
knowing which one you are working under, because the failure looks different:

| | What stops you |
|---|---|
| **GitHub Team** | The server rejects the push. There is no way around it. |
| **GitHub Free** (private repos) | GitHub enforces nothing. The `pre-push` hook in your clone refuses, and `main-guard` turns any push that gets through into a red X on `main` within a minute. |

On the free plan the rule is real but the wall is not, so treat a `main-guard`
failure as something to go and talk about, not a flaky job to re-run.

Name branches `type/short-description` — `tokens/raise-muted-contrast`,
`ci/design-gates`.

## Changing a token

`tokens/two.css` is a contract, not a stylesheet. `resources/css/two.css` in
two-web is a copy of it, so a value changed here changes the live site.

1. Change the value in `tokens/two.css`.
2. `npm run verify` — contrast must still be `43/43`.
3. Open the PR. `@two-gaming/frontend` is a code owner on `/tokens/` and will
   be asked to review, because they are the ones who have to copy it across.

The copy step is manual today. If you change a token and nobody copies the file
into two-web, the site keeps the old value and CI here still passes — there is
no check that catches that yet. Say so in the PR description until there is.

## Review

`.github/CODEOWNERS` decides who is asked. You cannot approve your own work.
Conversations have to be resolved before merge. Both apply to everyone,
including whoever set the rules up.
