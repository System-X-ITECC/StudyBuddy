import { createClient } from "@supabase/supabase-js"; // Use Supabase HTTPS APIs instead of local filesystem storage.
// Create a request-scoped client without shared authentication state.
export function supabase(token, admin = false) {
  // Create a request-scoped client without shared authentication state.
  const url = process.env.SUPABASE_URL; // Read the configured Supabase project origin.
  // Initialize key for the current operation.
  const key = admin
    // Restrict the elevated key to explicit admin operations.
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_ANON_KEY; // Restrict the elevated key to explicit admin operations.
  // Apply the following behavior only when its condition matches.
  if (!url || !key)
    // Stop this operation with a clear failure.
    throw Object.assign(
      // Supply this expression to the enclosing operation.
      new Error(
        // Supply this literal value to the enclosing operation.
        "Configure SUPABASE_URL, SUPABASE_ANON_KEY, and the server admin key.",
      // Close the current expression or block.
      ),
      // Report missing cloud configuration clearly.
      { status: 503 },
    ); // Report missing cloud configuration clearly.
  // Return the result to the calling operation.
  return createClient(url, key, {
    // Set the auth option for this operation.
    auth: {
      // Set the persistSession option for this operation.
      persistSession: true,
      // Set the autoRefreshToken option for this operation.
      autoRefreshToken: false,
      // Set the detectSessionInUrl option for this operation.
      detectSessionInUrl: false,
    // Close the current expression or block.
    },
    // Set the global option for this operation.
    global: {
      // Continue the current transformation.
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      // Set the fetch option for this operation.
      fetch: (url, options = {}) =>
        // Run fetch with the arguments below.
        fetch(url, {
          // Continue the current transformation.
          ...options,
          // Set the signal option for this operation.
          signal: options.signal || AbortSignal.timeout(20000),
        // Close the current expression or block.
        }),
    // Close the current expression or block.
    },
  }); // Keep each user's JWT isolated and bound cloud request duration.
} // Finish client construction.
// Standardize Supabase response checking.
export async function result(query) {
  // Standardize Supabase response checking.
  const { data, error } = await query; // Await the database operation.
  // Apply the following behavior only when its condition matches.
  if (error)
    // Stop this operation with a clear failure.
    throw Object.assign(new Error(error.message), {
      // Set the status option for this operation.
      status: error.code === "PGRST116" ? 404 : 400,
    }); // Propagate actionable cloud errors without stack traces.
  return data; // Return verified data to the route.
} // Finish response handling.
// Read the current user's explicit memory document.
export async function getProfile(req) {
  // Read the current user's explicit memory document.
  // Initialize row for the current operation.
  const row = await result(
    // Supply this expression to the enclosing operation.
    req.db
      // Continue the current transformation.
      .from("profiles")
      // Continue the current transformation.
      .select("settings")
      // Continue the current transformation.
      .eq("user_id", req.user)
      // RLS and the explicit predicate both enforce user ownership.
      .maybeSingle(),
  ); // RLS and the explicit predicate both enforce user ownership.
  return row?.settings || {}; // Treat a first-time account as memory-disabled.
} // Finish preference lookup.
// Persist a bounded preference document.
export async function putProfile(req, settings) {
  // Persist a bounded preference document.
  await result(req.db.from("profiles").upsert({ user_id: req.user, settings })); // Upsert only the current user's preferences.
  return settings; // Return the saved settings to the UI.
} // Finish preference persistence.
