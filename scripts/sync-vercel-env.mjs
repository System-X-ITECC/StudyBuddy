/** GitHub environment-protected job only. Never import this from the frontend. */
const e = process.env;
const required = [
  'VERCEL_TOKEN', 'VERCEL_PROJECT_ID', 'VERCEL_ORG_ID',
  'STUDYBUDDY_APP_ENV', 'STUDYBUDDY_SUPABASE_URL',
  'STUDYBUDDY_SUPABASE_PROJECT_REF', 'STUDYBUDDY_SUPABASE_PUBLISHABLE_KEY',
  'STUDYBUDDY_CLIENT_ORIGINS', 'STUDYBUDDY_ALLOW_REGISTRATION',
  'SUPABASE_SERVICE_ROLE_KEY', 'DEEPSEEK_API_KEY'
];
for (const key of required) if (!e[key]) throw new Error(`Missing required deployment configuration: ${key}`);
if (!['testbed', 'production'].includes(e.STUDYBUDDY_APP_ENV)) throw new Error('Invalid application environment');
const supabase = new URL(e.STUDYBUDDY_SUPABASE_URL);
if (supabase.protocol !== 'https:' || supabase.hostname !== `${e.STUDYBUDDY_SUPABASE_PROJECT_REF}.supabase.co` || supabase.pathname !== '/') throw new Error('Supabase origin/ref mismatch');
if (e.STUDYBUDDY_APP_ENV === 'production' && e.STUDYBUDDY_TESTBED_SUPABASE_PROJECT_REF === e.STUDYBUDDY_SUPABASE_PROJECT_REF) throw new Error('Refusing to deploy production against the testbed Supabase database');
const origins = e.STUDYBUDDY_CLIENT_ORIGINS.split(',').map(x => x.trim());
if (origins.length === 0 || origins.some(x => {try {const u=new URL(x);return u.origin!==x || u.protocol!=='https:';}catch{return true;}})) throw new Error('CLIENT_ORIGINS must list exact HTTPS origins');
if (!['true', 'false'].includes(e.STUDYBUDDY_ALLOW_REGISTRATION)) throw new Error('Registration toggle must be true/false');

const config = {
  APP_ENV: e.STUDYBUDDY_APP_ENV,
  CLIENT_ORIGINS: e.STUDYBUDDY_CLIENT_ORIGINS,
  SUPABASE_URL: e.STUDYBUDDY_SUPABASE_URL,
  EXPECTED_SUPABASE_PROJECT_REF: e.STUDYBUDDY_SUPABASE_PROJECT_REF,
  TESTBED_SUPABASE_PROJECT_REF: e.STUDYBUDDY_TESTBED_SUPABASE_PROJECT_REF || '',
  SUPABASE_ANON_KEY: e.STUDYBUDDY_SUPABASE_PUBLISHABLE_KEY,
  ALLOW_REGISTRATION: e.STUDYBUDDY_ALLOW_REGISTRATION,
  DEEPSEEK_MODEL: e.STUDYBUDDY_DEEPSEEK_MODEL || 'deepseek-chat',
  PRODUCTION_RELEASE_APPROVED: e.STUDYBUDDY_APP_ENV === 'production' ? 'YES' : 'NO'
};
const secrets = {
  SUPABASE_SERVICE_ROLE_KEY: e.SUPABASE_SERVICE_ROLE_KEY,
  DEEPSEEK_API_KEY: e.DEEPSEEK_API_KEY
};
const vars = [
  ...Object.entries(config).filter(([,v]) => v !== '').map(([key,value]) => ({key,value,type:'encrypted',visibility:'config',target:['production']})),
  ...Object.entries(secrets).map(([key,value]) => ({key,value,type:'sensitive',visibility:'secret',target:['production']}))
];
const api = `https://api.vercel.com/v10/projects/${encodeURIComponent(e.VERCEL_PROJECT_ID)}/env?upsert=true&teamId=${encodeURIComponent(e.VERCEL_ORG_ID)}`;
const result = await fetch(api, { method: 'POST', headers: { authorization: `Bearer ${e.VERCEL_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(vars), signal: AbortSignal.timeout(25000) });
if (!result.ok) {
  // Never log Vercel's response body, which may contain sensitive echo data.
  throw new Error(`Vercel environment sync rejected with HTTP ${result.status}`);
}
console.log(`Synced ${vars.length} named Vercel runtime variables without logging values.`);
