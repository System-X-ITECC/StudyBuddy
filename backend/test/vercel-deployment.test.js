import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = file => readFileSync(new URL(file, import.meta.url), "utf8");

test("Vercel includes the shared Express API and worker parser files", () => {
  const entry = read("../index.js");
  const config = JSON.parse(read("../vercel.json"));
  assert.match(entry, /import express from "express"/);
  assert.match(entry, /import api from "\.\/src\/index\.js"/);
  assert.match(entry, /export default app/);
  assert.equal(config.functions["index.js"].includeFiles, "src/**");
});

test("deployed API checks Supabase project before running", () => {
  const api = read("../src/index.js");
  assert.match(api, /process\.env\.VERCEL === "1"/);
  assert.match(api, /assertBackendEnvironment\(\)/);
  assert.match(api, /SUPABASE_SERVICE_ROLE_KEY/);
});

test("GitHub Pages uses public Vercel origin and never embeds server secrets", () => {
  const env = read("../../frontend/.env.github-pages.example");
  const code = read("../../frontend/src/scripts/app.js");
  const workflow = read("../../.github/workflows/deploy-pages-demo.yml");
  assert.match(env, /PUBLIC_API_URL=https:\/\/YOUR-VERCEL-PROJECT\.vercel\.app/);
  assert.match(code, /let origin = expectedApi;/);
  assert.match(workflow, /STUDYBUDDY_API_URL/);
  assert.match(workflow, /api\/health/);
  assert.doesNotMatch(workflow, /SUPABASE_SERVICE_ROLE_KEY|DEEPSEEK_API_KEY/);
});
