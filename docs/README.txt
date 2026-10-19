StudyBuddy secure CI/CD patch for System-X-ITECC/StudyBuddy

CONTENTS
  .github/workflows/testbed-ci.yml              - PR security + quality checks
  .github/workflows/production-release.yml       - approved Vercel API release
  .github/workflows/deploy-pages-demo.yml        - approved GitHub Pages release
  .github/CODEOWNERS                             - review ownership
  .github/CI-CD-SETUP.md                         - exact secret/variable settings
  INSTALL_WINDOWS.ps1                            - local installer with backups

INSTALL (Windows PowerShell, starting from extracted patch directory)
  & .\INSTALL_WINDOWS.ps1 -ProjectRoot "C:\path\to\StudyBuddy"

REVIEW, then commit from StudyBuddy repository directory:
  git switch -c security/production-cicd-gates
  git add .github/workflows .github/CODEOWNERS
  git add -f .github/CI-CD-SETUP.md
  git diff --cached
  git commit -m "ci: gate StudyBuddy releases and isolate production secrets"
  git push -u origin security/production-cicd-gates

Open a PR to main; enable main branch rules and production environment reviewers.
Manual environment and repository variable setup required before deploy workflow will run.

NO SECRETS ARE STORED IN THESE FILES.
These files have NOT been pushed to GitHub. No deployment has occurred.
