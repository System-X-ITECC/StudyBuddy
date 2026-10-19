/** Built-in zero-dependency guard. Not a replacement for GitHub secret scanning. */
import { execFileSync } from 'node:child_process';
import { readFileSync, lstatSync } from 'node:fs';

const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const errors = [];
for (const path of paths) {
  const p = path.replaceAll('\\', '/');
  const name = p.split('/').at(-1);
  if ((/^\.env(?:\..*)?$/i.test(name) || /\.env$/i.test(name) || /\.env\.local$/i.test(name)) && !/\.example$/i.test(name)) errors.push(`${p}: tracked local environment file`);
  if (/(?:^|\/)(?:PATCH_FILES|node_modules|dist|\.vercel)\//i.test(p)) errors.push(`${p}: tracked generated or backup content`);
  if (/\.(?:pem|p12|pfx|key|sqlite|db|bak)(?:-|$|\.)/i.test(p) || /\.bak-\d{8}/i.test(p)) errors.push(`${p}: dangerous backup or key material`);
  if (lstatSync(p).isSymbolicLink()) { errors.push(`${p}: symlink requires manual review`); continue; }
  const bytes = readFileSync(p);
  if (bytes.includes(0) || bytes.length > 2 * 1024 * 1024) continue;
  const text = bytes.toString('utf8');
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) errors.push(`${p}: private key detected`);
  if (/(?:ghp_|github_pat_|gho_|ghu_|ghs_)[A-Za-z0-9_]{30,}/.test(text)) errors.push(`${p}: GitHub token-like value`);
  // Real Supabase secret/API keys should never occur in source or examples.
  if (/sb_secret_[A-Za-z0-9_-]{25,}/.test(text)) errors.push(`${p}: Supabase server key-like value`);
}
if (errors.length) {
  console.error('SECURITY GATE FAILED:\n' + errors.join('\n'));
  process.exit(1);
}
console.log(`Repository hygiene check passed (${paths.length} tracked paths).`);
