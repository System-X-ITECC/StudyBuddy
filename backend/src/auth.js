import { z } from "zod"; // Validate authentication inputs before contacting Supabase.
import { supabase } from "./db.js"; // Create isolated cloud authentication clients.
// Translate Supabase's session contract for the static client.
export function sessionPayload(data) {
  // Translate Supabase's session contract for the static client.
  // Apply the following behavior only when its condition matches.
  if (!data.session)
    // Return the result to the calling operation.
    return {
      // Set the confirmationRequired option for this operation.
      confirmationRequired: true,
      // Set the message option for this operation.
      message: "Check your email to confirm the account, then sign in.",
    }; // Support projects with email confirmation enabled.
  // Return the result to the calling operation.
  return {
    // Set the token option for this operation.
    token: data.session.access_token,
    // Set the refreshToken option for this operation.
    refreshToken: data.session.refresh_token,
    // Set the expiresAt option for this operation.
    expiresAt: data.session.expires_at,
    // Set the name option for this operation.
    name: data.user.email,
  }; // Return renewable credentials without exposing server secrets.
} // Finish session serialization.
// Sign up or sign in through Supabase Auth.
export async function login(req, res) {
  // Sign up or sign in through Supabase Auth.
  // Initialize input for the current operation.
  const input = z
    // Continue the current transformation.
    .object({
      // Set the name option for this operation.
      name: z.string().email().max(254),
      // Set the password option for this operation.
      password: z.string().min(1).max(128),
      // Set the register option for this operation.
      register: z.boolean().optional(),
    // Close the current expression or block.
    })
    .parse(req.body); // Use email identities rather than custom local passwords.
  if (input.register && input.password.length < 12) return res.status(400).json({ error: "Use a password with at least 12 characters to sign up." });
  const client = supabase(); // Allocate a client for this authentication operation only.
  // Apply the following behavior only when its condition matches.
  if (input.register && process.env.ALLOW_REGISTRATION !== "true")
    // Return the result to the calling operation.
    return res
      // Honor the API's registration switch.
      .status(403)
      .json({ error: "New accounts are disabled by the API administrator." }); // Honor the API's registration switch.
  const credentials = { email: input.name, password: input.password }; // Map the form fields to Supabase credentials.
  // Supply this expression to the enclosing operation.
  const { data, error } = input.register
    // Let Supabase hash passwords, confirm email, and issue sessions.
    ? await client.auth.signUp(credentials)
    : await client.auth.signInWithPassword(credentials); // Let Supabase hash passwords, confirm email, and issue sessions.
  if (error) {
    // Preserve rate limiting and failed-login semantics for the client, without leaking internals.
    const status = error.status === 429 ? 429 : error.status >= 500 ? 502 :
      input.register ? 400 : 401;
    const message = status === 429 ? 'Too many attempts. Please try again later.' :
      status === 502 ? 'Authentication is temporarily unavailable. Please retry shortly.' :
      String(error.message || 'Authentication failed.').slice(0, 180);
    return res.status(status).json({ error: message });
  }
  res.json(sessionPayload(data)); // Return a session or confirmation instruction.
} // Finish authentication.
// Renew expired access tokens with a refresh token.
export async function refresh(req, res) {
  // Renew expired access tokens with a refresh token.
  // Initialize refresh_token for the current operation.
  const refresh_token = z
    // Continue the current transformation.
    .string()
    // Continue the current transformation.
    .min(10)
    // Bound the supplied credential.
    .max(4096)
    .parse(req.body.refreshToken); // Bound the supplied credential.
  // Supply this expression to the enclosing operation.
  const { data, error } = await supabase().auth.refreshSession({
    // Rotate the session through Supabase Auth.
    refresh_token,
  }); // Rotate the session through Supabase Auth.
  // Apply the following behavior only when its condition matches.
  if (error)
    // Return the result to the calling operation.
    return res
      // Require login when refresh is no longer valid.
      .status(401)
      .json({ error: "Your session expired. Please sign in again." }); // Require login when refresh is no longer valid.
  res.json(sessionPayload(data)); // Return the rotated refresh and access tokens together.
} // Finish session refresh.
// Verify the caller with Supabase Auth on every protected request.
export async function authenticate(req, res, next) {
  // Verify the caller with Supabase Auth on every protected request.
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]; // Read the explicit bearer credential.
  if (!token) return res.status(401).json({ error: "Sign in to continue." }); // Reject anonymous workspace access.
  const db = supabase(token); // Apply this JWT to all subsequent database calls.
  const { data, error } = await db.auth.getUser(token); // Verify against the auth server instead of trusting decoded claims.
  // Apply the following behavior only when its condition matches.
  if (error || !data.user)
    // Return the result to the calling operation.
    return res
      // Reject invalid or deleted users.
      .status(401)
      .json({ error: "Your session expired. Please sign in again." }); // Reject invalid or deleted users.
  // Supply this expression to the enclosing operation.
  req.user = data.user.id;
  // Supply this expression to the enclosing operation.
  req.email = data.user.email;
  // Supply this expression to the enclosing operation.
  req.token = token;
  // Bind user identity and RLS-scoped access to this request.
  req.db = db;
  next(); // Bind user identity and RLS-scoped access to this request.
} // Finish authentication middleware.
