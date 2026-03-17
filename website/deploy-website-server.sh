#!/usr/bin/env bash
set -euo pipefail

TAR_PATH="${1:-/home/admin/ai-api/website-release.tar.gz}"
DEPLOY_DIR="${2:-/home/admin/ai-api/website}"
SERVICE_NAME="${3:-website}"

BASE_DIR="$(dirname "${DEPLOY_DIR}")"
TS="$(date +%F-%H%M%S)"
TMP_DIR="${BASE_DIR}/website.new.${TS}"
BACKUP_DIR="${DEPLOY_DIR}.bak.${TS}"

if [[ ! -f "${TAR_PATH}" ]]; then
  echo "Error: tarball not found: ${TAR_PATH}" >&2
  exit 1
fi

if [[ ! -d "${BASE_DIR}" ]]; then
  echo "Error: base directory not found: ${BASE_DIR}" >&2
  exit 1
fi

echo "[1/6] Extract to temp directory"
mkdir -p "${TMP_DIR}"
tar -xzf "${TAR_PATH}" -C "${TMP_DIR}"

echo "[2/6] Basic validation"
if [[ ! -f "${TMP_DIR}/server.js" ]]; then
  echo "Warning: ${TMP_DIR}/server.js not found. Confirm package content is correct." >&2
fi

echo "[3/6] Backup current website"
if [[ -d "${DEPLOY_DIR}" ]]; then
  mv "${DEPLOY_DIR}" "${BACKUP_DIR}"
fi

echo "[4/6] Switch to new website"
mv "${TMP_DIR}" "${DEPLOY_DIR}"

echo "[5/6] Clean common macOS metadata if any"
find "${DEPLOY_DIR}" \
  \( -type f \( -name '._*' -o -name '.DS_Store' -o -name '.-*' -o -name '..-*' \) \) -delete
find "${DEPLOY_DIR}" -type d -name '__MACOSX' -prune -exec rm -rf {} +

echo "[6/6] Restart docker service: ${SERVICE_NAME}"
cd "${BASE_DIR}"
docker compose restart "${SERVICE_NAME}" || docker compose up -d "${SERVICE_NAME}"

echo "Deploy completed."
echo "Backup saved at: ${BACKUP_DIR}"
