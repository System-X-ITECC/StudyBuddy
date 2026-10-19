// Vercel detects this as its Node.js Express entrypoint.
// All /api/* routes remain in src/index.js so local development and
// serverless deployments run the same handlers and Supabase RLS checks.
import express from "express";
import api from "./src/index.js";

const app = express();
app.disable("x-powered-by");
app.use(api);
export default app;
