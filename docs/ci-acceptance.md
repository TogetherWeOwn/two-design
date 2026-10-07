# Docs-only CI acceptance probe

This disposable draft pull request verifies docs-only change gating.
It changes documentation only and must not be merged.

Expected results: change detection reports `code=false`, `tests` is skipped,
and `ci-ok`, PR-title lint and secret scanning succeed automatically.
These are expectations, not observed results.
