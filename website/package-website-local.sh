#!/usr/bin/env bash
set -euo pipefail

WEBSITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_TAR="${1:-${WEBSITE_DIR}/website-release.tar.gz}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed or not in PATH." >&2
  exit 1
fi

if [[ ! -d "${WEBSITE_DIR}" ]]; then
  echo "Error: website directory not found: ${WEBSITE_DIR}" >&2
  exit 1
fi

cd "${WEBSITE_DIR}"

echo "[1/4] Build website"
pnpm run build

echo "[2/4] Prepare standalone assets"
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/

echo "[3/4] Create tarball: ${OUTPUT_TAR}"
rm -f "${OUTPUT_TAR}"
COPYFILE_DISABLE=1 tar \
  --exclude='.DS_Store' \
  --exclude='__MACOSX' \
  --exclude='._*' \
  --exclude='.-*' \
  --exclude='..-*' \
  -czf "${OUTPUT_TAR}" \
  -C .next/standalone .

echo "[4/4] Done"
ls -lh "${OUTPUT_TAR}"

echo "Package ready: ${OUTPUT_TAR}"
