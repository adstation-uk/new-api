---
name: i18n-maintainer
description: Maintain large Next.js/next-intl localization files with low context cost. Use when adding or refactoring translation keys, debugging MISSING_MESSAGE errors, checking multi-locale key parity, extracting a namespace for focused edits, or syncing new keys from one source locale into other locales without loading full locale files into model context.
---

# I18n Maintainer

## Overview
Use scripts first, then open only the necessary namespace in locale files. Avoid reading full `locales/*.json` unless structure is broken.

## Workflow

1. Validate JSON and key parity
- Run:
	- `python3 scripts/i18n-diff.py --base locales/en.json --target locales/zh.json`
- If output says key sets are aligned, do not diff full files manually.

2. Narrow to a namespace before editing
- Run:
	- `python3 scripts/i18n-slice.py --file locales/zh.json --prefix Page.Home`
	- `python3 scripts/i18n-slice.py --file locales/en.json --prefix Page.Home`
- Only load/edit the reported subtree.

3. Apply focused changes
- Keep structure identical across locales.
- Keep placeholders identical (`{username}`, `{count}`).
- Use semantic key names; avoid sentence-as-key.

4. Re-check after edits
- Run diff script again and ensure:
	- `missing_in_target: 0`
	- `missing_in_base: 0`

5. Sync source-locale additions to other locales (optional)
- Run dry-run first:
	- `python3 scripts/i18n-sync.py --source locales/zh.json --targets locales/en.json locales/vi.json`
- Apply changes:
	- `python3 scripts/i18n-sync.py --source locales/zh.json --targets locales/en.json locales/vi.json --apply`
- This only adds missing keys in targets and never deletes existing keys.

## Debugging MISSING_MESSAGE

When error is like `Could not resolve Page.Home`:

1. Run key diff script first.
2. If key exists but still fails, run namespace slice and verify nesting is correct (not accidentally moved to top-level).
3. If JSON parse fails, repair structure before any content edits.

## Rules for Large Locale Files

- Prefer `i18n_slice.py` output over full-file reads.
- Prefer `i18n-slice.py` output over full-file reads.
- Do not paste entire locale files into context.
- Keep edits namespace-scoped and minimal.
- If adding a new page namespace, add it in both locales in the same change.

## Resources

- `scripts/i18n-diff.py`: Compare key parity between two locale files.
- `scripts/i18n-slice.py`: Print one namespace subtree as compact JSON.
- `scripts/i18n-sync.py`: Add missing keys from base locale into one or more target locale files.
- `references/troubleshooting.md`: Fast checklist for common i18n failures.
