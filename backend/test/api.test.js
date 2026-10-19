import test from "node:test";
import assert from "node:assert/strict";

// This test specifically verifies the API's behaviour without cloud credentials.
// Do not let credentials from an already-configured developer machine alter it.
test("independent API exports without SQLite or cloud credentials and reports setup errors", async () => {
  const envKeys = [
    "APP_ENV",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const priorEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  let server;

  try {
    process.env.APP_ENV = "testbed";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Import after selecting the controlled environment; no real Supabase calls.
    const { default: app } = await import("../src/index.js");
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve, reject) => {
      if (server.listening) return resolve();
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const base = `http://127.0.0.1:${server.address().port}/api`;

    const healthResponse = await fetch(`${base}/health`);
    assert.equal(healthResponse.status, 200);
    const health = await healthResponse.json();
    assert.equal(health.provider, "supabase-node-api");
    assert.equal(health.environment, "testbed");
    assert.equal(health.databaseConfigured, false);

    const mismatch = await fetch(`${base}/login`, {
      method: "POST",
      headers: { "X-StudySpace-Environment": "production" },
    });
    assert.equal(mismatch.status, 409);

    const anonymous = await fetch(`${base}/chats`, {
      headers: { "X-StudySpace-Environment": "testbed" },
    });
    assert.equal(anonymous.status, 401);

    const login = await fetch(`${base}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-StudySpace-Environment": "testbed",
      },
      body: JSON.stringify({
        name: "person@example.com",
        password: "example-password-123",
      }),
    });
    assert.equal(login.status, 503, `Expected missing Supabase config to return 503; received ${login.status}: ${await login.clone().text()}`);
    assert.match((await login.json()).error, /SUPABASE/i);
  } finally {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    for (const [key, oldValue] of Object.entries(priorEnv)) {
      if (oldValue === undefined) delete process.env[key];
      else process.env[key] = oldValue;
    }
  }
});
