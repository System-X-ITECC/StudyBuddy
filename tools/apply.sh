#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
ROOT="$(cd "$ROOT" && pwd -P)"
PATCH_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../PATCH" && pwd -P)"
[[ "$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" == "$ROOT" ]] || { echo 'Pass the StudyBuddy repo root.' >&2; exit 2; }
remote="$(git -C "$ROOT" remote get-url origin)"
case "$remote" in
  https://github.com/System-X-ITECC/StudyBuddy|https://github.com/System-X-ITECC/StudyBuddy.git|git@github.com:System-X-ITECC/StudyBuddy.git|ssh://git@github.com/System-X-ITECC/StudyBuddy.git) ;;
  *) echo "Unexpected origin: $remote" >&2; exit 2 ;;
esac
if [[ -n "$(git -C "$ROOT" status --porcelain)" ]]; then
  echo 'Commit or stash current changes before applying this patch.' >&2
  exit 2
fi
BACKUP="$(mktemp -d "${TMPDIR:-/tmp}/studybuddy-ci-config-backup.XXXXXXXX")"
files=(
  .github/workflows/testbed-ci.yml
  .github/workflows/production-release.yml
  backend/test/database.test.js
  backend/test/library-contract.test.js
  backend/test/vercel-deployment.test.js
  scripts/service-status.mjs
  scripts/tests/service-status.test.mjs
)
for name in "${files[@]}"; do
  if [[ -e "$ROOT/$name" ]]; then
    mkdir -p "$BACKUP/$(dirname "$name")"
    cp -p "$ROOT/$name" "$BACKUP/$name"
  fi
done
for name in "${files[@]}"; do
  mkdir -p "$ROOT/$(dirname "$name")"
  cp "$PATCH_DIR/$name" "$ROOT/$name"
done
printf 'Patch installed without modifying secrets, private migrations, or Git history.\nBackup: %s\n' "$BACKUP"
