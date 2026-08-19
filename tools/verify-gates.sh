#!/usr/bin/env bash
#
# Proves the design-system gates actually gate.
#
# A check nobody has watched fail is a check nobody knows works. This breaks the
# repo four ways in a throwaway copy and asserts each break is caught by the right
# gate for the right reason. It never touches your working tree.
#
#   ./tools/verify-gates.sh
#
# Run it after any change to tools/check-contrast.mjs, tools/build-preview.mjs or
# .github/workflows/ci.yml. Needs nothing but bash, git and node.

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

ok=0
pass() { printf '\033[32mPASS\033[0m  %s\n' "$1"; }
fail() { printf '\033[31mFAIL\033[0m  %s\n' "$1"; ok=1; }

# The gates, as the workflow runs them. Kept here as one function so the two places
# cannot drift into disagreeing about what "green" means.
#
# Every step is `|| return 1` rather than leaning on `set -e`. This function is
# called from inside an `if`, and bash suspends `set -e` for everything in an `if`
# condition — which meant the first draft of this script reported a deleted
# assertion as PASS. That is the same class of bug as the missing `pipefail` below:
# a check that runs, prints a failure, and exits zero.
gates() (
  set -o pipefail          # without this a failing node piped into tee reports tee

  # Mirrors the "No dependencies" step in ci.yml. It lives here too because a
  # gate that only exists in the workflow is a gate nobody has watched fail.
  if node -e "const p=require('./package.json'); process.exit((p.dependencies||p.devDependencies) ? 1 : 0)"; then
    :
  else
    echo "two-design has grown a dependency — that was a deliberate zero"
    return 1
  fi

  node tools/check-contrast.mjs | tee contrast.txt || return 1

  local asserted
  asserted=$(grep -oE '[0-9]+/[0-9]+ pairings pass' contrast.txt | cut -d/ -f2 | cut -d' ' -f1) || return 1
  [ -n "$asserted" ] || { echo "could not read the pairing count"; return 1; }
  if [ "$asserted" -lt "${MINIMUM_PAIRINGS:-43}" ]; then
    echo "contrast coverage dropped to $asserted pairings — a pairing was deleted, not fixed"
    return 1
  fi

  node tools/build-preview.mjs || return 1
  git diff --exit-code -- preview/ || return 1
)

copy() {
  local dest="$WORK/$1"
  git -C "$REPO" ls-files -z | tar -C "$REPO" --null -T - -cf - | (mkdir -p "$dest" && tar -C "$dest" -xf -)
  git -C "$dest" init -q
  git -C "$dest" add -A
  git -C "$dest" -c user.email=qa@two -c user.name=QA commit -qm base
  echo "$dest"
}

expect_red() {
  local name="$1" dir="$2"
  if (cd "$dir" && gates) > "$dir/gates.log" 2>&1; then
    fail "$name — the gates went GREEN on a break they are supposed to catch"
    sed 's/^/      /' "$dir/gates.log" | tail -5
  else
    pass "$name"
  fi
}

echo "== the clean repo must be green =="
clean=$(copy clean)
if (cd "$clean" && gates) > "$clean/gates.log" 2>&1; then
  pass "a clean tree passes both gates"
else
  fail "a clean tree does NOT pass — fix this before trusting anything below"
  sed 's/^/      /' "$clean/gates.log" | tail -20
fi

echo
echo "== each deliberate break must be rejected =="

# 1. A token change that drops a real pairing under 4.5:1.
d=$(copy contrast); sed -i 's/#9e96b5/#6a6480/' "$d/tokens/two.css"
expect_red "a token that fails WCAG 2.2 AA contrast" "$d"

# 2. The gate defeated the easy way: delete the assertion instead of fixing the
#    colour. Exit status alone would not catch this — the coverage floor does.
d=$(copy deleted); sed -i "/'ink on online-quiet panel'/d" "$d/tools/check-contrast.mjs"
expect_red "a pairing deleted rather than fixed" "$d"

# 3. A token edited without regenerating the preview.
d=$(copy drift); sed -i '0,/#0b0714/s//#0b0715/' "$d/tokens/two.css"
expect_red "preview left stale after a token change" "$d"

# 4. A dependency added. The zero here is deliberate — it is why these gates run
#    in ~30s with no install step, and why nobody is tempted to route around them.
d=$(copy dependency)
node -e '
  const f = process.argv[1] + "/package.json";
  const fs = require("fs");
  const p = JSON.parse(fs.readFileSync(f, "utf8"));
  p.dependencies = { "left-pad": "^1.3.0" };
  fs.writeFileSync(f, JSON.stringify(p, null, 2) + "\n");
' "$d"
expect_red "a dependency added to a deliberately zero-dependency repo" "$d"

echo
if [ "$ok" -ne 0 ]; then
  echo "The design-system gates do not catch everything they claim to."
  exit 1
fi
echo "Gates verified: clean is green, and every deliberate break is rejected."
