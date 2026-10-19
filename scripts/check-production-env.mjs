// Safe local preflight. Does not connect to cloud services and never prints key values.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function parseFile(path) {
  const obj={};
  for (const line of readFileSync(path,'utf8').split(/\r?\n/)) {
    const m = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (m) obj[m[1]]=m[2].replace(/^(["'])(.*)\1$/, '$2');
  }
  return obj;
}
function check() {
 const api=parseFile(resolve('backend/.env.production'));
 const client=parseFile(resolve('frontend/.env.production'));
 const problems=[];
 const must=(ok,msg)=>{if(!ok)problems.push(msg)};
 const isPlaceholder=x=>!x || /YOUR_|CHANGE_ME|PLACEHOLDER|\.example\.|\.invalid|api\.example\.com/i.test(x);
 must(api.APP_ENV==='production','backend APP_ENV must equal production');
 must(client.PUBLIC_APP_ENV==='production','frontend PUBLIC_APP_ENV must equal production');
 must(api.PRODUCTION_RELEASE_APPROVED==='YES' && client.PRODUCTION_RELEASE_APPROVED==='YES','release is locked (PRODUCTION_RELEASE_APPROVED=NO)');
 must(!isPlaceholder(api.SUPABASE_URL),'production Supabase URL missing');
 must(!isPlaceholder(api.EXPECTED_SUPABASE_PROJECT_REF),'production Supabase ref missing');
 let u;try{u=new URL(api.SUPABASE_URL)}catch{}
 must(Boolean(u && u.protocol==='https:' && u.origin===api.SUPABASE_URL && u.hostname===`${api.EXPECTED_SUPABASE_PROJECT_REF}.supabase.co`),'Supabase URL/ref mismatch');
 must(api.TESTBED_SUPABASE_PROJECT_REF !== api.EXPECTED_SUPABASE_PROJECT_REF,'production must use a distinct Supabase project');
 for(const key of ['SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','DEEPSEEK_API_KEY'])must(!isPlaceholder(api[key]),`backend ${key} is missing`);
 let v;try{v=new URL(client.PUBLIC_API_URL)}catch{}
 must(Boolean(v && v.protocol==='https:' && v.origin===client.PUBLIC_API_URL && !v.hostname.endsWith('.supabase.co') && !isPlaceholder(client.PUBLIC_API_URL)),'frontend API URL must be the deployed HTTPS Vercel origin');
 must(api.CLIENT_ORIGINS==='https://system-x-itecc.github.io','backend CLIENT_ORIGINS must be exact GitHub Pages origin');
 if(problems.length){console.error(`Production config: NOT READY (${problems.length} items)`);for(const p of problems)console.error(' - '+p);process.exitCode=1;}else{console.log('Production config syntax: READY (no live cloud test performed)')}
}
check();
