import test from "node:test";
import assert from "node:assert/strict";
import { apiErrorStatus, apiErrorMessage } from "../src/http-errors.js";

test("missing Supabase configuration returns HTTP 503", () => {
  const error = Object.assign(
    new Error("Configure SUPABASE_URL, SUPABASE_ANON_KEY, and the server admin key."),
    { status: 503 }
  );
  assert.equal(apiErrorStatus(error), 503);
  assert.match(apiErrorMessage(error, 503), /SUPABASE_URL/);
  assert.doesNotMatch(apiErrorMessage(error, 503, true), /SUPABASE_URL/);
});

test("wrapped setup failures are still classified as 503", () => {
  assert.equal(apiErrorStatus(new Error("Configure SUPABASE_URL, SUPABASE_ANON_KEY, and the server admin key.")), 503);
  assert.equal(apiErrorStatus({code: "SUPABASE_NOT_CONFIGURED", message: "Backend not configured"}), 503);
});

test("unexpected internal errors are HTTP 500 with generic production message", () => {
  const error = new Error("private SQL statement and connection details");
  assert.equal(apiErrorStatus(error), 500);
  assert.doesNotMatch(apiErrorMessage(error, 500, true), /private SQL/);
});

test("payload validation and throttling return appropriate HTTP codes", () => {
  assert.equal(apiErrorStatus({name: "ZodError"}), 400);
  assert.equal(apiErrorStatus({type: "entity.too.large"}), 413);
  assert.equal(apiErrorStatus({status: 429}), 429);
  assert.equal(apiErrorStatus({status: 502}), 500);
});
