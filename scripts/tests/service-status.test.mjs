import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectServices } from '../service-status.mjs';

const supa = {
  STUDYBUDDY_SUPABASE_URL: 'https://dhksfuricdmeaeysszyc.supabase.co',
  STUDYBUDDY_SUPABASE_PROJECT_REF: 'dhksfuricdmeaeysszyc',
  STUDYBUDDY_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_dummy_for_configuration_only',
};
const vercel = { STUDYBUDDY_API_URL: 'https://studybuddy-api.vercel.app' };

test('both missing fails (including placeholders)', () => {
  assert.deepEqual(inspectServices({}), {vercelConfigured:false, supabaseConfigured:false, ok:false});
  assert.equal(inspectServices({STUDYBUDDY_API_URL:'https://example.invalid'}).ok, false);
  assert.equal(inspectServices({STUDYBUDDY_API_URL:'https://YOUR-VERCEL-PROJECT.vercel.app'}).ok, false);
});
test('Vercel alone allows general CI and identifies Supabase as missing', () => {
  assert.deepEqual(inspectServices(vercel), {vercelConfigured:true, supabaseConfigured:false, ok:true});
});
test('Supabase alone allows general CI and identifies Vercel as missing', () => {
  assert.deepEqual(inspectServices(supa), {vercelConfigured:false, supabaseConfigured:true, ok:true});
});
test('both configured passes', () => {
  assert.deepEqual(inspectServices({...vercel,...supa}), {vercelConfigured:true, supabaseConfigured:true, ok:true});
});
test('Supabase reference mismatch is rejected', () => {
  assert.equal(inspectServices({...supa,STUDYBUDDY_SUPABASE_PROJECT_REF:'differentref12345'}).supabaseConfigured, false);
});
test('Supabase URL alone without public key is not complete configuration', () => {
  assert.equal(inspectServices({STUDYBUDDY_SUPABASE_URL:supa.STUDYBUDDY_SUPABASE_URL,STUDYBUDDY_SUPABASE_PROJECT_REF:supa.STUDYBUDDY_SUPABASE_PROJECT_REF}).ok, false);
});
test('non-HTTPS, local and Supabase-as-Vercel URLs are rejected', () => {
  for (const uri of ['http://studybuddy-api.vercel.app','https://127.0.0.1','https://dhksfuricdmeaeysszyc.supabase.co','https://studybuddy-api.vercel.app/extra']) {
    assert.equal(inspectServices({STUDYBUDDY_API_URL:uri}).vercelConfigured,false,uri);
  }
});
