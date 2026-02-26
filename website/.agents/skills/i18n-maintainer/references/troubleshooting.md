# i18n Troubleshooting Checklist

## 1) MISSING_MESSAGE for an existing key

- Run `i18n-diff.py` first to verify key parity.
- Run `i18n-slice.py` for that namespace and check nesting level.
- Typical root cause: subtree accidentally moved from `Page.xxx` to top-level.

## 2) JSON parse errors after manual edits

- Validate locale JSON before any semantic changes.
- Fix structure issues first (missing comma/bracket/brace), then rerun parity check.

## 3) Placeholder mismatch

- Ensure placeholders are identical across locales.
- Example: if en has `{username}`, zh must use `{username}` (not `{name}`).

## 4) Large-file context pressure

- Never load full locale files by default.
- Extract only impacted namespace with `i18n-slice.py` and edit that subtree.
