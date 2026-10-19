import test from "node:test"; // Exercise the actual migration in an embedded PostgreSQL engine.
import assert from "node:assert/strict"; // Verify isolation and transaction guarantees.
import { readFile } from "node:fs/promises"; // Read the shipped migration rather than duplicating its SQL.
import { PGlite } from "@electric-sql/pglite"; // Run PostgreSQL locally without cloud credentials.
// Run test with the arguments below.
test("Supabase schema enforces RLS, ownership, leases, quotas, and cascading deletion", async () => {
  // Validate database behavior with two simulated Auth identities.
  const db = new PGlite(); // Allocate an isolated in-memory Postgres database.
  // Initialize a for the current operation.
  const a = "11111111-1111-4111-8111-111111111111";
  const b = "22222222-2222-4222-8222-222222222222"; // Define stable fixture identities.
  // Close the database even after a failed assertion.
  try {
    // Close the database even after a failed assertion.
    // Wait for this asynchronous operation before continuing.
    await db.exec(
      // Reproduce only the Auth platform contracts the migration depends on.
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to authenticated;`,
    ); // Reproduce only the Auth platform contracts the migration depends on.
    // Wait for this asynchronous operation before continuing.
    await db.exec(
      // Wait for this asynchronous operation before continuing.
      await readFile(
        // Supply this expression to the enclosing operation.
        new URL(
          // Supply this literal value to the enclosing operation.
          "../../supabase/migrations/001_studyspace.sql",
          // Import the module dependencies used below.
          import.meta.url,
        // Close the current expression or block.
        ),
        // Apply the real migration, including functions and RLS.
        "utf8",
      // Close the current expression or block.
      ),
    ); // Apply the real migration, including functions and RLS.
    await db.query("insert into auth.users values($1),($2)", [a, b]); // Create two test users without contacting Supabase.
    // Initialize as for the current operation.
    const as = async (id) => {
      // Wait for this asynchronous operation before continuing.
      await db.exec("reset role");
      // Wait for this asynchronous operation before continuing.
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        // Supply this expression to the enclosing operation.
        id,
      // Close the current expression or block.
      ]);
      // Wait for this asynchronous operation before continuing.
      await db.exec("set role authenticated");
    }; // Run each assertion under a real restricted database role.
    await as(a); // Begin as the first user.
    // Initialize chat for the current operation.
    const chat = (
      // Wait for this asynchronous operation before continuing.
      await db.query(
        // Create a user-owned chat.
        "insert into chats(user_id,title) values($1,'New conversation') returning id",
        // Supply this expression to the enclosing operation.
        [a],
      // Close the current expression or block.
      )
    ).rows[0].id; // Create a user-owned chat.
    // Wait for this asynchronous operation before continuing.
    await db.query(
      // Save evidence through the transactional source function.
      "select * from save_source($1,'Lesson','A sufficiently useful source for learning.','')",
      // Save evidence through the transactional source function.
      [chat],
    ); // Save evidence through the transactional source function.
    await as(b); // Switch to the second user.
    assert.equal((await db.query("select * from chats")).rows.length, 0); // Hide the first user's conversation through RLS.
    assert.equal((await db.query("select * from sources")).rows.length, 0); // Hide the first user's source text.
    // Wait for this asynchronous operation before continuing.
    await assert.rejects(() =>
      // Run db.query with the arguments below.
      db.query(
        // Prevent same-owner rows from linking to another user's chat.
        "insert into sources(chat_id,user_id,name,text) values($1,$2,'bad','cross-account')",
        // Supply this expression to the enclosing operation.
        [chat, b],
      // Close the current expression or block.
      ),
    ); // Prevent same-owner rows from linking to another user's chat.
    // Run assert.equal with the arguments below.
    assert.equal(
      // Supply this expression to the enclosing operation.
      (await db.query("select claim_generation($1) as lease", [chat])).rows[0]
        // Continue the current transformation.
        .lease,
      // Deny a cross-account generation lease.
      null,
    ); // Deny a cross-account generation lease.
    await as(a); // Return to the chat owner.
    // Initialize lease for the current operation.
    const lease = (
      // Wait for this asynchronous operation before continuing.
      await db.query("select claim_generation($1) as lease", [chat])
    // Acquire the distributed lease.
    ).rows[0].lease;
    assert.ok(lease); // Acquire the distributed lease.
    // Run assert.equal with the arguments below.
    assert.equal(
      // Supply this expression to the enclosing operation.
      (await db.query("select claim_generation($1) as lease", [chat])).rows[0]
        // Continue the current transformation.
        .lease,
      // Reject a concurrent generation on another hypothetical instance.
      null,
    ); // Reject a concurrent generation on another hypothetical instance.
    await db.query("select release_generation($1,$2)", [chat, b]); // Attempt release with a stale or foreign lease token.
    // Run assert.equal with the arguments below.
    assert.equal(
      // Supply this expression to the enclosing operation.
      (await db.query("select claim_generation($1) as lease", [chat])).rows[0]
        // Continue the current transformation.
        .lease,
      // Keep the live lease protected from stale requests.
      null,
    ); // Keep the live lease protected from stale requests.
    // Wait for this asynchronous operation before continuing.
    await db.query(
      // Commit both messages and release the lease atomically.
      "select finish_generation($1,$2,'Explain the source','A grounded answer')",
      // Commit both messages and release the lease atomically.
      [chat, lease],
    ); // Commit both messages and release the lease atomically.
    // Run assert.deepEqual with the arguments below.
    assert.deepEqual(
      // Supply this expression to the enclosing operation.
      (
        // Wait for this asynchronous operation before continuing.
        await db.query("select role from messages order by created_at")
      // Supply this expression to the enclosing operation.
      ).rows.map((row) => row.role),
      // Preserve user-before-assistant ordering.
      ["user", "assistant"],
    ); // Preserve user-before-assistant ordering.
    // Supply this expression to the enclosing operation.
    for (let n = 0; n < 12; n++)
      // Run assert.equal with the arguments below.
      assert.equal(
        // Supply this expression to the enclosing operation.
        (await db.query("select consume_budget('ai') as ok")).rows[0].ok,
        // Allow the configured distributed AI budget.
        true,
      ); // Allow the configured distributed AI budget.
    // Run assert.equal with the arguments below.
    assert.equal(
      // Supply this expression to the enclosing operation.
      (await db.query("select consume_budget('ai') as ok")).rows[0].ok,
      // Reject requests beyond the same-minute budget.
      false,
    ); // Reject requests beyond the same-minute budget.
    await assert.rejects(() => db.query("delete from request_budgets")); // Prevent clients from resetting quotas directly.
    await db.exec("reset role");
    await db.query("delete from auth.users where id=$1", [a]); // Simulate Auth's server-side account deletion.
    // Run assert.equal with the arguments below.
    assert.equal((await db.query("select * from chats")).rows.length, 0);
    // Run assert.equal with the arguments below.
    assert.equal((await db.query("select * from messages")).rows.length, 0);
    assert.equal((await db.query("select * from sources")).rows.length, 0); // Verify cascading cleanup of application records.
  // Release the local PostgreSQL runtime.
  } finally {
    // Wait for this asynchronous operation before continuing.
    await db.close();
  } // Release the local PostgreSQL runtime.
}); // Finish cloud-schema verification.
