import test from "node:test";
import assert from "node:assert/strict";
import { assertBackendEnvironment } from "../src/environment.js";
const base = { APP_ENV: "testbed", SUPABASE_URL: "https://testproject.supabase.co", SUPABASE_ANON_KEY: "dummy-key", EXPECTED_SUPABASE_PROJECT_REF: "testproject", CLIENT_ORIGINS: "http://localhost:4321" };
test("testbed refuses a different Supabase project", () => {
  assert.equal(assertBackendEnvironment(base), true);
  assert.throws(() => assertBackendEnvironment({ ...base, EXPECTED_SUPABASE_PROJECT_REF: "productionproject" }), /mismatch/);
});
test("production is blocked until specifically approved", () => {
  const production = { ...base, APP_ENV: "production", CLIENT_ORIGINS: "https://studyspace.example.com", TESTBED_SUPABASE_PROJECT_REF: "testproject-other", SUPABASE_SERVICE_ROLE_KEY: "dummy-secret", DEEPSEEK_API_KEY: "dummy-model-key" };
  assert.throws(() => assertBackendEnvironment(production), /Production is locked/);
  assert.equal(assertBackendEnvironment({ ...production, PRODUCTION_RELEASE_APPROVED: "YES" }), true);
});
