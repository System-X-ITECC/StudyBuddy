import { defineConfig } from "astro/config";

// The repo is a project Pages site, so static assets need /StudyBuddy/ when
// deploying through GitHub Actions. Local dev and other static hosts use /.
const target = process.env.STUDYBUDDY_DEPLOY_TARGET || "local";
if (!["local", "github-pages"].includes(target)) {
  throw new Error("STUDYBUDDY_DEPLOY_TARGET must be local or github-pages.");
}
const pages = target === "github-pages";

export default defineConfig({
  output: "static",
  outDir: "./dist",
  ...(pages ? { site: "https://system-x-itecc.github.io", base: "/StudyBuddy/" } : { base: "/" }),
  vite: { build: { target: "es2022" } },
});
