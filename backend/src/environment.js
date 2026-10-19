// This check runs before the backend starts listening; production is deliberately gated.
export function assertBackendEnvironment(env = process.env) {
  if (!["testbed", "production"].includes(env.APP_ENV)) throw new Error("APP_ENV must be testbed or production.");
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) throw new Error("Supabase URL/publishable key missing.");
  const url = new URL(env.SUPABASE_URL);
  const actualRef = url.hostname.split(".")[0];
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) throw new Error("Supabase URL must be the HTTPS project origin.");
  if (!env.EXPECTED_SUPABASE_PROJECT_REF || actualRef !== env.EXPECTED_SUPABASE_PROJECT_REF) throw new Error("Supabase project ref mismatch: refusing startup.");
  if (!env.CLIENT_ORIGINS || !env.CLIENT_ORIGINS.split(",").every(o => { try { const u = new URL(o); return u.origin === o && ["https:", "http:"].includes(u.protocol); } catch { return false; } })) throw new Error("Configure exact CLIENT_ORIGINS.");
  if (env.APP_ENV === "production" && env.TESTBED_SUPABASE_PROJECT_REF === actualRef) throw new Error("Production must use a Supabase project different from testbed.");
  if (env.APP_ENV === "production" && env.CLIENT_ORIGINS.split(",").some(o => !o.startsWith("https://"))) throw new Error("Production frontend must use HTTPS.");
  if (env.APP_ENV === "production" && (!env.SUPABASE_SERVICE_ROLE_KEY || !env.DEEPSEEK_API_KEY)) throw new Error("Production server keys missing.");
  if (env.APP_ENV === "production" && env.PRODUCTION_RELEASE_APPROVED !== "YES") throw new Error("Production is locked. Set PRODUCTION_RELEASE_APPROVED=YES only after release checks.");
  return true;
}
