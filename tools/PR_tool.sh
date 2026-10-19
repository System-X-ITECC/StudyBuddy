#!/usr/bin/env bash
# StudyBuddy interactive PR assistant (Git Bash). Never force-pushes, never merges.
#
# Works with plain git. If the GitHub CLI (gh) is installed and logged in it creates the PR
# for you; otherwise it pushes the branch and gives you a ready-made "open PR" link.
# Set STUDYBUDDY_NO_GH=1 to force the link flow even when gh is available.
#
# Usage: studybuddy-pr-assistant.sh [repo-dir]
set -Eeuo pipefail

EXPECTED='System-X-ITECC/StudyBuddy'
BASE='main'
ROOT_INPUT="${1:-.}"

die()  { printf '[error] %s\n' "$*" >&2; exit 1; }
info() { printf '[info] %s\n' "$*"; }
lc()   { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }
ask()  { local a; read -r -p "$1 [y/N]: " a || return 1; [[ "$a" =~ ^([yY]|[yY][eE][sS])$ ]]; }

urlenc() { # urlenc STRING [EXTRA_SAFE_CHARS]
  local s=$1 keep=${2:-} i c out=''
  local LC_ALL=C
  for ((i = 0; i < ${#s}; i++)); do
    c=${s:i:1}
    if [[ "$c" =~ [a-zA-Z0-9.~_-] ]] || { [[ -n "$keep" && "$keep" == *"$c"* ]]; }; then
      out+=$c
    else
      out+=$(printf '%%%02X' "'$c")
    fi
  done
  printf '%s' "$out"
}

# True (0) if the lower-cased path is private/generated and must not be in a PR.
is_unsafe() {
  case "$1" in
    *.env|*.env.*) [[ "$1" == *.example ]] || return 0 ;;
  esac
  case "$1" in
    *.sql|supabase/migrations/*|*/supabase/migrations/*|*.pem|*.key|*.p12|*.pfx|*.sqlite*|*.db|*.bak*|\
    .vercel/*|*/.vercel/*|node_modules/*|*/node_modules/*|dist/*|*/dist/*|patch_files/*|*/patch_files/*)
      return 0 ;;
  esac
  return 1
}

command -v git >/dev/null 2>&1 || die 'Missing git'

ROOT=$(cd "$ROOT_INPUT" && pwd -P) || die 'Invalid repo directory'
g() { git -C "$ROOT" "$@"; }
ROOT=$(g rev-parse --show-toplevel 2>/dev/null) || die 'Not a Git repository'

remote=$(g remote get-url origin) || die 'Missing origin'
case "$remote" in
  https://github.com/*)   slug=${remote#https://github.com/} ;;
  git@github.com:*)       slug=${remote#git@github.com:} ;;
  ssh://git@github.com/*) slug=${remote#ssh://git@github.com/} ;;
  *) die 'Unsupported remote host; expected github.com' ;;
esac
slug=${slug%/}; slug=${slug%.git}
[[ "$(lc "$slug")" == "$(lc "$EXPECTED")" ]] || die "origin points to $slug, not $EXPECTED"

# Optional GitHub CLI.
USE_GH=0
if [[ -z "${STUDYBUDDY_NO_GH:-}" ]] && command -v gh >/dev/null 2>&1 \
   && gh auth status --hostname github.com >/dev/null 2>&1; then
  actual=$(gh repo view "$EXPECTED" --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || true)
  if [[ "$(lc "$actual")" == "$(lc "$EXPECTED")" ]]; then USE_GH=1; fi
fi
if ((USE_GH)); then
  info 'GitHub CLI detected: the PR will be created for you.'
else
  info 'GitHub CLI not used: after pushing you will get a link to open the PR in your browser.'
fi

# Hygiene checks. Staged changes are scanned before commit, the whole PR range before push.
scan_paths() { # scan_paths LABEL <git diff args...>
  local label=$1; shift
  local violations=() p
  while IFS= read -r -d '' p; do
    if is_unsafe "$(lc "$p")"; then violations+=("$p"); fi
  done < <(g diff "$@" --name-only --diff-filter=ACMR -z)
  if ((${#violations[@]})); then
    printf '[blocked] Unsafe %s paths:\n' "$label" >&2
    printf ' - %s\n' "${violations[@]}" >&2
    die 'Remove these private/generated files from the change (git rm --cached / git reset) and try again'
  fi
}

run_hygiene() { # run_hygiene staged|range
  if [[ -f "$ROOT/scripts/security-guard.mjs" ]] && command -v node >/dev/null 2>&1; then
    (cd "$ROOT" && node scripts/security-guard.mjs) || die 'Repository hygiene check failed'
  fi
  if command -v gitleaks >/dev/null 2>&1; then
    info "Running gitleaks ($1)"
    if [[ "$1" == staged ]]; then
      if gitleaks git --help >/dev/null 2>&1; then
        (cd "$ROOT" && gitleaks git --staged --redact --no-banner) || die 'gitleaks found possible secrets'
      else
        (cd "$ROOT" && gitleaks protect --staged --redact --no-banner) || die 'gitleaks found possible secrets'
      fi
    else
      if gitleaks git --help >/dev/null 2>&1; then
        (cd "$ROOT" && gitleaks git --log-opts="origin/$BASE..HEAD" --redact --no-banner) || die 'gitleaks found possible secrets'
      else
        (cd "$ROOT" && gitleaks detect --log-opts="origin/$BASE..HEAD" --redact --no-banner) || die 'gitleaks found possible secrets'
      fi
    fi
  else
    info 'gitleaks not installed: no secret scan was run (path checks only).'
  fi
}

info "Working repo: $ROOT"
info "Remote: $remote"
g fetch origin "$BASE" || die "Could not fetch origin/$BASE"

branch=$(g symbolic-ref --quiet --short HEAD) || die 'Detached HEAD: switch branches first'
if [[ "$branch" == "$BASE" || "$branch" == master ]]; then
  read -r -p 'New feature branch (e.g. fix/secure-workflows): ' created || die 'Input closed'
  [[ -n "$created" ]] || die 'No branch selected'
  git check-ref-format --branch "$created" >/dev/null 2>&1 || die 'Invalid branch name'
  [[ "$created" != "$BASE" && "$created" != master ]] || die 'Cannot PR from main/master'
  if g show-ref --verify --quiet "refs/heads/$created"; then die 'Branch already exists locally'; fi
  if g show-ref --verify --quiet "refs/remotes/origin/$created"; then die 'Branch already exists remotely'; fi
  g switch -c "$created"
  branch=$created
fi
info "Feature branch: $branch"

# Bring the branch up to date with origin/main automatically (never auto-resolves conflicts).
# STUDYBUDDY_SYNC=rebase|merge skips the question.
sync_with_base() {
  local behind ahead published=0 choice method orig
  if [[ -n "$(g status --porcelain=v1 --untracked-files=no)" ]]; then
    g status --short --untracked-files=no
    die "Your branch is behind origin/$BASE, but you have uncommitted changes to tracked files. Commit them or run 'git stash' first, then re-run (untracked files are fine)."
  fi
  behind=$(g rev-list --count "HEAD..origin/$BASE")
  ahead=$(g rev-list --count "origin/$BASE..HEAD")
  info "Branch is $behind commit(s) behind and $ahead commit(s) ahead of origin/$BASE."

  if g show-ref --verify --quiet "refs/remotes/origin/$branch"; then published=1; fi
  if ((published)); then
    info "origin/$branch already exists, so rewriting history (rebase) would need a force-push. Merge is the safe choice."
  fi

  method=${STUDYBUDDY_SYNC:-}
  if [[ -z "$method" ]]; then
    if ((published)); then
      printf '\nUpdate options: [1] Merge origin/%s into %s (recommended) [2] Cancel\n' "$BASE" "$branch"
      read -r -p 'Choice [1]: ' choice || die 'Input closed'
      case "${choice:-1}" in 1) method=merge ;; 2) die 'Cancelled' ;; *) die 'Invalid option' ;; esac
    else
      printf '\nUpdate options: [1] Rebase onto origin/%s (recommended, linear history) [2] Merge origin/%s [3] Cancel\n' "$BASE" "$BASE"
      read -r -p 'Choice [1]: ' choice || die 'Input closed'
      case "${choice:-1}" in 1) method=rebase ;; 2) method=merge ;; 3) die 'Cancelled' ;; *) die 'Invalid option' ;; esac
    fi
  fi
  case "$method" in rebase|merge) ;; *) die "STUDYBUDDY_SYNC must be rebase or merge (got '$method')" ;; esac
  if [[ "$method" == rebase ]] && ((published)); then
    die "Refusing to rebase: origin/$branch is already published and the script never force-pushes. Use merge."
  fi

  orig=$(g rev-parse HEAD)
  # No autostash on purpose: a conflict while re-applying stashed work cannot be aborted cleanly.
  # With a clean tracked tree, any conflict is aborted automatically and nothing is lost.
  if [[ "$method" == rebase ]]; then
    info "Rebasing $branch onto origin/$BASE"
    if ! g rebase "origin/$BASE"; then
      g rebase --abort >/dev/null 2>&1 || true
      die "Rebase hit conflicts and was aborted; your branch is back to $(g rev-parse --short "$orig"). Resolve manually: git rebase origin/$BASE"
    fi
  else
    info "Merging origin/$BASE into $branch"
    if ! g merge --no-edit "origin/$BASE"; then
      g merge --abort >/dev/null 2>&1 || true
      die "Merge hit conflicts and was aborted; your branch is back to $(g rev-parse --short "$orig"). Resolve manually: git merge origin/$BASE"
    fi
  fi

  g merge-base --is-ancestor "origin/$BASE" HEAD || die "Still not up to date with origin/$BASE after updating"
  info "Up to date with origin/$BASE (previous tip: $(g rev-parse --short "$orig"); undo with: git reset --hard $orig)"
}

# Never stage files silently; staging everything is opt-in and checked afterward.
if [[ -n "$(g status --porcelain=v1 --untracked-files=all)" ]]; then
  g status --short
  printf '\nStage options: [1] Keep existing staging [2] git add -p [3] Stage ALL [4] Cancel\n'
  read -r -p 'Choice [1]: ' mode || die 'Input closed'
  case "${mode:-1}" in
    1) : ;;
    2) g add -p ;;
    3) read -r -p 'Type STAGE ALL to stage every working-tree change: ' confirmation || die 'Input closed'
       [[ "$confirmation" == 'STAGE ALL' ]] || die 'Cancelled staging'
       g add -A ;;
    4) die 'Cancelled' ;;
    *) die 'Invalid option' ;;
  esac
fi

if ! g diff --cached --quiet; then
  scan_paths staged --cached
  g diff --cached --check || die 'Staged whitespace/conflict errors'
  g diff --cached --stat
  info 'Review the complete diff yourself: git diff --cached'
  run_hygiene staged
  if ask 'Commit staged changes?'; then
    read -r -p 'Commit message: ' msg || die 'Input closed'
    [[ -n "$msg" ]] || die 'Commit message must not be blank'
    g commit -m "$msg"
  fi
fi
if ! g diff --cached --quiet; then die 'Staged but uncommitted changes remain'; fi
if [[ -n "$(g status --porcelain=v1 --untracked-files=all)" ]]; then
  info 'Uncommitted files remain; they are NOT part of the PR.'
  ask 'Continue with existing commits only?' || die 'Cancelled'
fi

# Update after committing, so a conflict can be aborted cleanly and nothing uncommitted is at risk.
if ! g merge-base --is-ancestor "origin/$BASE" HEAD; then
  sync_with_base
fi

commits=$(g rev-list --count "origin/$BASE..HEAD")
((commits > 0)) || die "No commits ahead of origin/$BASE"
info "Commits in PR: $commits"
g log --oneline -n 15 "origin/$BASE..HEAD"

# Scan everything that will actually be pushed, including commits made earlier.
scan_paths 'PR' "origin/$BASE...HEAD"
run_hygiene range

read -r -p "Type EXACTLY $EXPECTED to verify destination: " confirm || die 'Input closed'
[[ "$confirm" == "$EXPECTED" ]] || die 'Confirmation mismatch'
ask "Push $branch to origin (no force)?" || die 'Cancelled before push'
g push -u origin "HEAD:refs/heads/$branch" || die 'Push failed'

last=$(g log -1 --pretty=%s)
read -r -p "PR title [$last]: " title || true
title=${title:-$last}
read -r -p 'One-line PR description (optional): ' desc || true
desc=${desc:-'Security and functionality checks must pass; please review before merging.'}

if ((USE_GH)); then
  existing=$(gh pr view "$branch" --repo "$EXPECTED" --json url --jq .url 2>/dev/null || true)
  if [[ -n "$existing" ]]; then info "Existing PR: $existing"; exit 0; fi
  options=(pr create --repo "$EXPECTED" --head "$branch" --base "$BASE" --title "$title" --body "$desc")
  if ask 'Create draft PR?'; then options+=(--draft); fi
  ask 'Create the Pull Request now?' || { info 'Branch pushed; PR not created.'; exit 0; }
  gh "${options[@]}"
  info 'PR submitted. No automatic merge or production deploy performed.'
else
  url="https://github.com/$EXPECTED/compare/$BASE...$(urlenc "$branch" '/')?expand=1&title=$(urlenc "$title")&body=$(urlenc "$desc")"
  info 'Branch pushed. Open this link to create the PR (use the dropdown on the green button for a draft):'
  printf '\n%s\n\n' "$url"
  if ask 'Open it in your browser now?'; then
    if command -v cmd.exe >/dev/null 2>&1; then cmd.exe //c start "" "$url" || true
    elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$url" || true
    elif command -v open >/dev/null 2>&1; then open "$url" || true
    else info 'No browser launcher found; copy the link above.'; fi
  fi
  info 'No automatic merge or production deploy performed.'
fi