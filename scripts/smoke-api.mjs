// Safe smoke test: checks health / anonymous access only; never creates user accounts.
const target = process.argv[2] || "http://localhost:8787";
const mode = process.argv[3] || "testbed";
if (!["production", "testbed"].includes(mode)) throw new Error("Provide testbed or production mode");
const base = new URL("/api/", target);
const health = await fetch(new URL("health", base));
if (!health.ok) throw new Error(`Backend health check failed: ${health.status}`);
const details = await health.json();
if (details.environment !== mode || details.provider !== "supabase-node-api") throw new Error("Environment or API provider mismatch");
const anonymous = await fetch(new URL("chats", base), { headers: { "X-StudySpace-Environment": mode } });
if (anonymous.status !== 401) throw new Error(`Expected 401 for anonymous chat history, got ${anonymous.status}`);
console.log(`PASS: ${mode} backend is responding and rejects anonymous chat access. Configuration flags:`, { databaseConfigured: details.databaseConfigured, aiConfigured: details.aiConfigured });
