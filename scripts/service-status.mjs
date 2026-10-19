/**
 * Public configuration preflight for StudyBuddy CI.
 * This checks declared endpoints/keys, NOT live connectivity or secret validity.
 * Never include server-only credentials in PR jobs.
 */
import { appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const populated = (value) => typeof value === 'string' && value.trim().length > 0 &&
  !/(?:YOUR[_-]|PLACEHOLDER|CHANGE_ME|EXAMPLE|INSERT[_-]|<|>)/i.test(value);

function httpsOrigin(value) {
  if (!populated(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.origin !== value || url.username || url.password || url.search || url.hash) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes('.') || host === 'localhost' || host.endsWith('.local') ||
        host.endsWith('.invalid') || host.endsWith('.example') || host.endsWith('.test') ||
        host === '127.0.0.1' || host === '0.0.0.0') return null;
    return url;
  } catch { return null; }
}

export function inspectServices(env = process.env) {
  const api = httpsOrigin(env.STUDYBUDDY_API_URL || env.PUBLIC_API_URL);
  const vercelConfigured = Boolean(api && !api.hostname.endsWith('.supabase.co'));
  const supabase = httpsOrigin(env.STUDYBUDDY_SUPABASE_URL || env.SUPABASE_URL);
  const ref = (env.STUDYBUDDY_SUPABASE_PROJECT_REF || env.EXPECTED_SUPABASE_PROJECT_REF || '').trim();
  const publishable = env.STUDYBUDDY_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY;
  const supabaseConfigured = Boolean(
    supabase && /^[a-z0-9]{12,32}$/.test(ref) &&
    supabase.hostname === `${ref}.supabase.co` &&
    populated(publishable) && !/\s/.test(publishable)
  );
  return { vercelConfigured, supabaseConfigured, ok: vercelConfigured || supabaseConfigured };
}

export function printServices(report, write = console.log) {
  write(`Vercel API: ${report.vercelConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  write(`Supabase: ${report.supabaseConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  write(report.ok ? 'CI configuration gate: PASS (at least one configured)' : 'CI configuration gate: FAIL (neither configured)');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = inspectServices();
  printServices(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `### Public service configuration (not a connectivity test)\n` +
      `- Vercel API: **${report.vercelConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}**\n` +
      `- Supabase: **${report.supabaseConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}**\n` +
      `- Gate: **${report.ok ? 'PASS' : 'FAIL'}**\n`);
  }
  if (!report.ok) process.exitCode = 1;
}
