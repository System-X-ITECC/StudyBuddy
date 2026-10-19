import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const [profile, app, action] = process.argv.slice(2);
if (!["testbed", "production"].includes(profile) || !["frontend", "backend"].includes(app) || !["dev", "build", "start"].includes(action)) {
  console.error("Usage: node scripts/run-profile.mjs <testbed|production> <frontend|backend> <dev|build|start>"); process.exit(2);
}
const file = join(app, `.env.${profile}`);
if (!existsSync(file)) { console.error(`Missing ${file}. Copy its .example and configure it first.`); process.exit(2); }
const values = {};
for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
  const match = raw.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (match) values[match[1]] = match[2].replace(/^("|')(.*)\1$/, "$2");
}
if (values.APP_ENV && values.APP_ENV !== profile) throw new Error(`APP_ENV in ${file} does not match ${profile}`);
if (values.PUBLIC_APP_ENV && values.PUBLIC_APP_ENV !== profile) throw new Error(`PUBLIC_APP_ENV in ${file} does not match ${profile}`);
if (profile === "production" && values.PRODUCTION_RELEASE_APPROVED !== "YES") {
  throw new Error("Production build/start is LOCKED. Complete release checklist and set PRODUCTION_RELEASE_APPROVED=YES in the production env file.");
}
const script = app === "frontend" ? (action === "build" ? "build" : "dev") : (action === "start" ? "start" : "dev");
const spawn = spawnSync("npm", ["run", "--workspace", app, script], { env: { ...process.env, ...values }, shell: process.platform === "win32", stdio: "inherit" });
process.exit(spawn.status ?? 1);
