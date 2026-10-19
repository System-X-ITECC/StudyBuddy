#!/usr/bin/env bash
# Install current StudyBuddy privacy/CI patch, in a disposable feature branch.
set -Eeuo pipefail
HERE=$(cd -- "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
ROOT_INPUT="${1:-.}"
[[ "${2:-}" == --apply ]] || { echo "PREVIEW ONLY. Usage: bash tools/install-public-patch.sh /path/to/StudyBuddy --apply";echo 'Will replace .gitignore, 2 tests, frontend example, guard, protected workflow, and Git Bash tools.';exit 0; }
ROOT=$(cd "$ROOT_INPUT" && pwd -P)
git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null || exit 1
[[ "$(git -C "$ROOT" branch --show-current)" != main ]] || { echo 'Create a feature branch first; refusing modifications on main' >&2;exit 1; }
[[ -z "$(git -C "$ROOT" status --porcelain --untracked-files=all)" ]] || { echo 'Working tree must be clean before installation' >&2;exit 1; }
remote=$(git -C "$ROOT" remote get-url origin)
case "$remote" in
  https://github.com/System-X-ITECC/StudyBuddy.git|https://github.com/System-X-ITECC/StudyBuddy|git@github.com:System-X-ITECC/StudyBuddy.git|git@github.com:System-X-ITECC/StudyBuddy) : ;;
  *) echo 'Unexpected Git remote; refusing' >&2;exit 1;;
esac
if git -C "$ROOT" ls-files | grep -E '(^|/)supabase/migrations/|\.sql$';then
  echo 'Existing SQL tracked; first move SQL into private repo and remove from public index using git rm --cached' >&2;exit 1
fi
backup=$(mktemp -d "${TMPDIR:-/tmp}/studybuddy-public-patch-backup-XXXXXX")
for path in .gitignore frontend/.env.github-pages.example backend/test/database.test.js backend/test/library-contract.test.js scripts/security-guard.mjs .github/workflows/production-release.yml tools/PR_tool.sh tools/wipe-repo.sh tools/install-public-patch.sh;do
  [[ -f "$ROOT/$path" ]] || continue
  mkdir -p "$backup/$(dirname "$path")"
  cp "$ROOT/$path" "$backup/$path"
done
echo "Backup of replaced files: $backup"
for path in .gitignore frontend/.env.github-pages.example backend/test/database.test.js backend/test/library-contract.test.js scripts/security-guard.mjs .github/workflows/production-release.yml tools/PR_tool.sh tools/wipe-repo.sh tools/install-public-patch.sh; do
  mkdir -p "$ROOT/$(dirname "$path")"
  cp "$HERE/$path" "$ROOT/$path"
done
node --check "$ROOT/backend/test/database.test.js"
node --check "$ROOT/backend/test/library-contract.test.js"
node --check "$ROOT/scripts/security-guard.mjs"
bash -n "$ROOT/tools/PR_tool.sh" "$ROOT/tools/wipe-repo.sh"
# assert private files ignored and public template not ignored
git -C "$ROOT" check-ignore -q --no-index -- supabase/migrations/001_studyspace.sql || { echo 'SQL should be ignored' >&2;exit 1; }
if git -C "$ROOT" check-ignore -q --no-index -- frontend/.env.github-pages.example; then echo 'Safe template is unexpectedly ignored' >&2; exit 1; fi
echo 'Patch installed. Review git diff, run npm test, commit in feature branch and open a PR.'
