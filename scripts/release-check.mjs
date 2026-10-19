import { existsSync } from "node:fs";
const checks = ["frontend/dist/index.html", "supabase/migrations/001_studyspace.sql", "supabase/migrations/002_studyspace_library.sql", "backend/src/rate-limit.js", "backend/src/environment.js"];
for (const path of checks) if (!existsSync(path)) throw new Error(`Release check failed: ${path} missing`);
console.log("Static preflight complete. Do not deploy until npm audit, full CI, Supabase RLS, user flows and performance tests pass.");
