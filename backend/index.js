/**
 * StudyBuddy — Vercel Express API Entry Point
 *
 * Compatible with:
 * - New StudyBuddy frontend
 * - Legacy StudySpace frontend
 * - Vercel Node.js serverless runtime
 * - Supabase authentication and RLS
 * - Testbed and production environments
 */

import express from "express";
import api from "./src/index.js";

const app = express();

// Hide Express technology disclosure.
app.disable("x-powered-by");

/**
 * Environment header compatibility middleware.
 *
 * The original API expects:
 * X-StudySpace-Environment
 *
 * The new frontend sends:
 * X-StudyBuddy-Environment
 *
 * Translate the new header for the existing API without
 * bypassing its environment validation.
 */
app.use((req, res, next) => {
  const studyBuddyEnv = req
    .get("X-StudyBuddy-Environment")
    ?.trim();

  const legacyEnv = req
    .get("X-StudySpace-Environment")
    ?.trim();

  // Reject conflicting environment declarations.
  if (
    studyBuddyEnv &&
    legacyEnv &&
    studyBuddyEnv !== legacyEnv
  ) {
    return res.status(409).json({
      error: "Conflicting StudyBuddy environment headers."
    });
  }

  // Support new clients with the old backend.
  if (studyBuddyEnv) {
    req.headers["x-studyspace-environment"] =
      studyBuddyEnv;
  }

  // Keep the backend's original environment check.
  next();
});

// Mount the existing Express API.
// All routes remain in backend/src/index.js.
app.use(api);

// Forward any errors not handled by the API.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(
    "[StudyBuddy API]",
    err?.message || "Unexpected request error"
  );

  res.status(500).json({
    error: "An unexpected server error occurred."
  });
});

export default app;
