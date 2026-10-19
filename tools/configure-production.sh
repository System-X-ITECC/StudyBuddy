#!/usr/bin/env bash
# StudyBuddy GitHub Actions: production environment secrets and repository variables.
# Run from Git Bash with an authenticated GitHub CLI. No secrets are written to disk.
set -euo pipefail
REPO="System-X-ITECC/StudyBuddy"
ENV_NAME="production"
MODE="${1:---check}"
case "$MODE" in
  --check|--set-secrets|--set-variables|--remove-duplicate-repo-secrets) ;;
  *) echo 'Usage: bash tools/configure-production.sh [--check|--set-secrets|--set-variables|--remove-duplicate-repo-secrets]' >&2; exit 2 ;;
esac
command -v gh >/dev/null || { echo 'GitHub CLI (gh) is required. Run gh auth login after installation.' >&2; exit 2; }
# No secret values should reach a shell trace.
case $- in *x*) echo 'Disable bash xtrace (set +x) before running this script.' >&2; exit 2;; esac
if ! gh auth status >/dev/null 2>&1; then echo 'GitHub CLI is not authenticated. Run gh auth login.' >&2; exit 1; fi
if ! gh repo view "$REPO" --json nameWithOwner --jq .nameWithOwner >/dev/null 2>&1; then
  echo "Cannot access $REPO with this gh account. Check permissions, DNS, and whether the repo exists." >&2; exit 1;
fi
if ! gh api "repos/$REPO/environments/$ENV_NAME" >/dev/null 2>&1; then
  echo "No readable '$ENV_NAME' Environment found for $REPO." >&2
  echo "First create it and add protection rules at https://github.com/$REPO/settings/environments" >&2
  echo 'Recommended: main-only deployment, required reviewer(s), prevent self-review if available.' >&2
  exit 1
fi
printf '\nRepository: %s\nGitHub Environment: %s\n' "$REPO" "$ENV_NAME"

env_summaries() {
  local n
  echo 'Environment secrets (names only):'
  gh secret list --repo "$REPO" --env "$ENV_NAME" || true
  echo 'Repository secrets (names only; review any duplicates):'
  gh secret list --repo "$REPO" || true
  echo 'Repository-wide variables (names and non-sensitive values):'
  gh variable list --repo "$REPO" || true
  echo 'Environment protection rules (types, not secret data):'
  gh api "repos/$REPO/environments/$ENV_NAME" --jq '.protection_rules[]?.type' || true
}

confirm() {
  local expected="$1" got
  printf 'Type EXACTLY %s to continue: ' "$expected" > /dev/tty
  IFS= read -r got < /dev/tty
  [[ "$got" == "$expected" ]] || { echo 'Cancelled; no changes made for this operation.' >&2; exit 1; }
}

read_value() {
  local var="$1" prompt="$2" default="${3:-}" value
  printf '%s%s: ' "$prompt" "${default:+ [$default]}" > /dev/tty
  IFS= read -r value < /dev/tty
  if [[ -z "$value" ]]; then value="$default"; fi
  printf -v "$var" '%s' "$value"
}

set_repo_variable() {
  local name="$1" value="$2"
  [[ -z "$value" ]] && { printf 'SKIP %-43s (not provided)\n' "$name"; return; }
  gh variable set "$name" --repo "$REPO" --body "$value"
  printf 'SET  %s (repository-wide variable)\n' "$name"
}

if [[ "$MODE" == --check ]]; then
  env_summaries
  echo 'No settings were changed.'
  exit 0
fi

if [[ "$MODE" == --set-secrets ]]; then
  echo 'Secrets will be written ONLY to the protected production Environment, not to repository-level secrets.'
  confirm 'PRODUCTION-SECRETS'
  for name in VERCEL_TOKEN SUPABASE_SERVICE_ROLE_KEY DEEPSEEK_API_KEY STUDYBUDDY_MIGRATIONS_READ_TOKEN; do
    echo "\n$name"
    echo 'Paste the secret when prompted; input is hidden. Press Enter to skip this secret.'
    secret=''
    IFS= read -r -s -p 'Secret: ' secret < /dev/tty
    printf '\n' > /dev/tty
    if [[ -z "$secret" ]]; then echo "SKIP $name"; continue; fi
    # Pipe via STDIN (never command arguments or a shell command line). GitHub CLI encrypts values.
    if printf '%s' "$secret" | gh secret set "$name" --repo "$REPO" --env "$ENV_NAME"; then
      echo "SET  $name in Environment $ENV_NAME"
    else
      unset secret
      echo "Failed setting $name; stopping." >&2
      exit 1
    fi
    unset secret
  done
  echo 'Set environment secrets, then check that required reviewers / branch restrictions are active.'
  exit 0
fi

if [[ "$MODE" == --set-variables ]]; then
  echo 'These values are NOT secrets and are visible to jobs and members with relevant access.'
  echo 'Do not paste DeepSeek, Vercel token or Supabase service_role keys as variables.'
  confirm 'REPOSITORY-VARIABLES'
  read_value app_env 'StudyBuddy APP_ENV (testbed or production)' 'testbed'
  [[ "$app_env" == testbed || "$app_env" == production ]] || { echo 'Invalid APP_ENV.' >&2; exit 1; }
  read_value supabase_ref 'Supabase project ref' 'dhksfuricdmeaeysszyc'
  [[ "$supabase_ref" =~ ^[a-z0-9]{20}$ ]] || { echo 'Supabase project ref must be 20 lowercase letters/digits.' >&2; exit 1; }
  if [[ "$app_env" == production && "$supabase_ref" == 'dhksfuricdmeaeysszyc' ]]; then
    echo 'REFUSED: the known testbed project cannot be marked as actual production.' >&2; exit 1
  fi
  read_value api_url 'Vercel API HTTPS origin (blank if not yet deployed)' ''
  if [[ -n "$api_url" ]]; then
    API_URL="$api_url" node --input-type=module -e '
      const raw=process.env.API_URL;
      const u=new URL(raw);
      if(u.protocol!=="https:" || u.origin!==raw || u.username || u.password || u.hostname.endsWith(".supabase.co") || u.hostname==="example.com") process.exit(1);
    ' || { echo 'Invalid API URL; must be an HTTPS origin, no path or credentials.' >&2; exit 1; }
  fi
  read_value publishable 'Supabase PUBLIC publishable/anon key (leave empty to skip)' ''
  read_value vercel_org 'Vercel organization/team ID (blank to skip)' ''
  read_value vercel_project 'Vercel backend project ID (blank to skip)' ''
  read_value private_repo 'Private migration repo (blank to skip)' ''
  read_value registrations 'Allow signup (true/false)' 'false'
  [[ "$registrations" == true || "$registrations" == false ]] || { echo 'Invalid registration setting.' >&2; exit 1; }
  echo 'Configuration validated. Repository variables will now be updated.'
  confirm 'WRITE-VARIABLES'
  set_repo_variable STUDYBUDDY_APP_ENV "$app_env"
  set_repo_variable STUDYBUDDY_SUPABASE_URL "https://${supabase_ref}.supabase.co"
  set_repo_variable STUDYBUDDY_SUPABASE_PROJECT_REF "$supabase_ref"
  set_repo_variable STUDYBUDDY_TESTBED_SUPABASE_PROJECT_REF 'dhksfuricdmeaeysszyc'
  set_repo_variable STUDYBUDDY_SUPABASE_PUBLISHABLE_KEY "$publishable"
  set_repo_variable STUDYBUDDY_API_URL "$api_url"
  set_repo_variable STUDYBUDDY_CLIENT_ORIGINS 'https://system-x-itecc.github.io'
  set_repo_variable STUDYBUDDY_ALLOW_REGISTRATION "$registrations"
  set_repo_variable STUDYBUDDY_DEEPSEEK_MODEL 'deepseek-chat'
  set_repo_variable VERCEL_ORG_ID "$vercel_org"
  set_repo_variable VERCEL_PROJECT_ID "$vercel_project"
  set_repo_variable STUDYBUDDY_PRIVATE_MIGRATIONS_REPO "$private_repo"
  unset publishable
  echo "Completed repository variable configuration for application mode '$app_env'."
  echo "GitHub deployment environment remains '$ENV_NAME'."
  exit 0
fi

if [[ "$MODE" == --remove-duplicate-repo-secrets ]]; then
  echo 'DANGER: delete only repository-level secret duplicates after confirming environment secrets were successfully populated.'
  echo 'This cannot retrieve or migrate existing secret values; it only removes REPOSITORY-level duplicates.'
  confirm 'DELETE-REPO-SECRET-DUPLICATES'
  for name in VERCEL_TOKEN SUPABASE_SERVICE_ROLE_KEY DEEPSEEK_API_KEY STUDYBUDDY_MIGRATIONS_READ_TOKEN; do
    if gh secret list --repo "$REPO" --env "$ENV_NAME" --json name --jq '.[].name' | grep -Fxq "$name"; then
      if gh secret list --repo "$REPO" --json name --jq '.[].name' | grep -Fxq "$name"; then
        echo "Delete REPOSITORY-level duplicate $name?"
        printf 'Type DELETE: ' > /dev/tty
        IFS= read -r answer < /dev/tty
        if [[ "$answer" == DELETE ]]; then
          gh secret delete "$name" --repo "$REPO"
          echo "Deleted repository-level duplicate $name"
        fi
      fi
    else
      echo "SKIP $name: not present in production Environment."
    fi
  done
fi
