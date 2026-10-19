import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertBackendEnvironment } from '../src/environment.js';

const ref = 'dhksfuricdmeaeysszyc';
test('configured hackathon Supabase URL and GitHub Pages origin pass testbed safeguards', () => {
  const env = {
    APP_ENV: 'testbed',
    SUPABASE_URL: `https://${ref}.supabase.co`,
    EXPECTED_SUPABASE_PROJECT_REF: ref,
    SUPABASE_ANON_KEY: 'sb_publishable_FOR_TEST_ONLY',
    CLIENT_ORIGINS: 'http://localhost:4321,https://system-x-itecc.github.io',
  };
  assert.equal(assertBackendEnvironment(env), true);
  assert.throws(() => assertBackendEnvironment({...env, EXPECTED_SUPABASE_PROJECT_REF: 'wrong'}), /mismatch/i);
  assert.throws(() => assertBackendEnvironment({...env, CLIENT_ORIGINS: 'https://github.com/System-X-ITECC/StudyBuddy.git'}), /CLIENT_ORIGINS/);
});

test('source config selects scoped GitHub Pages paths but preserves local paths', () => {
  const astro = readFileSync(new URL('../../frontend/astro.config.mjs', import.meta.url), 'utf8');
  const shell = readFileSync(new URL('../../frontend/src/pages/index.astro', import.meta.url), 'utf8');
  const worker = readFileSync(new URL('../../frontend/public/sw.js', import.meta.url), 'utf8');
  assert.match(astro, /base: "\/StudyBuddy\/"/);
  assert.match(astro, /STUDYBUDDY_DEPLOY_TARGET/);
  assert.match(shell, /publicBase/);
  assert.match(worker, /self\.registration\.scope/);
});
