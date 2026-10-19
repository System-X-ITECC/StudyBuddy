import { mountOrganisationRoutes, getOrganisation } from "./organisation.js";
import { libraryRouter, saveGeneratedItem, removeAccountLibraryFiles, saveExportItem } from "./library.js";
import express from "express"; // Run an independent Node/Express backend.
import { assertBackendEnvironment } from "./environment.js";
import cors from "cors"; // Allow only configured static-client origins.
import helmet from "helmet"; // Apply standard browser security headers.
import { z } from "zod"; // Validate request payloads and enum values.
import { supabase, result, getProfile, putProfile } from "./db.js"; // Use remote Postgres through Supabase with RLS.
import { createRateLimiter } from "./rate-limit.js";
import { login, refresh, authenticate } from "./auth.js"; // Authenticate and renew Supabase sessions.
import { extract } from "./parse-worker.js"; // Bound document parsing in disposable worker threads.
import { fetchPublic, MAX_TEXT } from "./sources.js"; // Reuse public-link validation and parsers.
import { answer } from "./ai.js"; // Keep all AI requests on the DeepSeek provider.
import { exportArtifact } from "./export.js"; // Produce Word and PDF downloads; PowerPoint export is disabled for the demo.
// Validate the deployed serverless runtime on every cold start, including demos.
// Local unit tests deliberately construct this app without cloud credentials.
if (process.env.APP_ENV === "production" || process.env.VERCEL === "1") {
  assertBackendEnvironment();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Deployed API requires a server-only Supabase key.");
  }
}
const app = express(); // App is reusable for local test, integration tests and production hosting.
// Initialize origins for the current operation.
const origins = (process.env.CLIENT_ORIGINS || "http://localhost:4321")
  // Parse exact browser origins.
  .split(",")
  .map((value) => value.trim()); // Parse exact browser origins.
// Run app.use with the arguments below.
app.use(
  // Run helmet with the arguments below.
  helmet(),
  // Run cors with the arguments below.
  cors({
    // Set the origin option for this operation.
    origin: (origin, callback) =>
      // Run callback with the arguments below.
      callback(null, !origin || origins.includes(origin)),
  // Close the current expression or block.
  }),
  // Run express.json with the arguments below.
  express.json({ limit: "2mb" }),
); // Bound JSON requests and apply cross-origin rules.
// Run app.get with the arguments below.
// Fail closed if a frontend built for testbed talks to production or vice versa.
// Health is allowed so the client can check the target before sending credentials.
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  const expected = process.env.APP_ENV || "testbed";
  const incoming = req.get("X-StudySpace-Environment");
  if (incoming !== expected) return res.status(409).json({ error: `Wrong environment: expected ${expected}.` });
  next();
});
app.get("/api/health", (_req, res) =>
  // Run res.json with the arguments below.
  res.json({
    // Set the ok option for this operation.
    ok: true,
    // Set the aiConfigured option for this operation.
    aiConfigured: Boolean(process.env.DEEPSEEK_API_KEY),
    // Set the databaseConfigured option for this operation.
    databaseConfigured: Boolean(
      // Supply this expression to the enclosing operation.
      process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY,
    // Close the current expression or block.
    ),
    // Set the provider option for this operation.
    provider: "supabase-node-api",
    environment: process.env.APP_ENV || "testbed",
  // Close the current expression or block.
  }),
); // Expose readiness flags without credentials.
app.post("/api/login", createRateLimiter({max:12}), login); // Delegate credential throttling and email confirmation to Supabase Auth.
app.post("/api/refresh", createRateLimiter({max:24}), refresh); // Renew sessions without storing credentials on a function instance.
app.use("/api", authenticate); // Protect every subsequent workspace operation.
// Run app.use with the arguments below.
app.use("/api", async (req, res, next) => {
  // Initialize allowed for the current operation.
  const allowed = await result(req.db.rpc("consume_budget", { p_kind: "api" }));
  // Apply the following behavior only when its condition matches.
  if (!allowed)
    // Return the result to the calling operation.
    return res
      // Continue the current transformation.
      .status(429)
      // Continue the current transformation.
      .json({ error: "Too many requests. Try again in a minute." });
  // Run next with the arguments below.
  next();
}); // Share per-user request budgets across the backend instances.
// Run app.post with the arguments below.
app.use("/api/library", libraryRouter); // Private user media and generated-learning library.
app.post("/api/logout", async (req, res) => {
  // Supply this expression to the enclosing operation.
  const { error } = await supabase(undefined, true).auth.admin.signOut(
    // Supply this expression to the enclosing operation.
    req.token,
    // Supply this literal value to the enclosing operation.
    "local",
  // Close the current expression or block.
  );
  // Apply the following behavior only when its condition matches.
  if (error) throw error;
  // Run res.json with the arguments below.
  res.json({ ok: true });
}); // Revoke this session's refresh token through the server-only admin API.
// Run app.get with the arguments below.
app.get("/api/profile", async (req, res) =>
  // Run res.json with the arguments below.
  res.json({
    // Set the name option for this operation.
    name: req.email,
    // Continue the current transformation.
    ...(await getProfile(req)),
    // Set the goals option for this operation.
    goals: (await result(req.db.from("achievements").select("goal"))).map(
      // Supply this expression to the enclosing operation.
      (row) => row.goal,
    // Close the current expression or block.
    ),
  // Close the current expression or block.
  }),
); // Read only RLS-visible preferences and milestones.
// Initialize profileSchema for the current operation.
const profileSchema = z.object({
  // Set the personalization option for this operation.
  personalization: z.boolean(),
  // Set the achievements option for this operation.
  achievements: z.boolean(),
  // Set the interests option for this operation.
  interests: z.string().max(600),
  // Set the difficulty option for this operation.
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  // Set the preferences option for this operation.
  preferences: z.string().max(1200),
  displayName: z.string().trim().max(60).optional(),
  customPrompt: z.string().trim().max(1600).optional(),
}); // Preserve explicit, bounded personalization controls.
// Run app.put with the arguments below.
app.put("/api/profile", async (req, res) =>
  // Run res.json with the arguments below.
  res.json(
    // Wait for this asynchronous operation before continuing.
    await putProfile(req, {
      // Continue the current transformation.
      ...(await getProfile(req)),
      // Continue the current transformation.
      ...profileSchema.parse(req.body),
    // Close the current expression or block.
    }),
  // Close the current expression or block.
  ),
); // Save settings without losing inspectable topic counters.
// Run app.delete with the arguments below.
app.delete("/api/profile/topics", async (req, res) => {
  // Initialize profile for the current operation.
  const profile = await getProfile(req);
  // Supply this expression to the enclosing operation.
  delete profile.frequentSubjects;
  // Supply this expression to the enclosing operation.
  delete profile.lastStyle;
  // Run res.json with the arguments below.
  res.json(await putProfile(req, profile));
}); // Clear learned habits independently of written preferences.
// Run app.delete with the arguments below.
app.delete("/api/profile/memory", async (req, res) => {
  // Forget learning preferences without deleting conversation organisation.
  // Folder IDs and assignments are workspace data, not learned AI memory.
  const previous = await getProfile(req);
  const { folders, assignments } = getOrganisation(previous);
  await putProfile(req, {
    chatFolders: folders,
    chatFolderAssignments: assignments,
  });
  // Wait for this asynchronous operation before continuing.
  await result(req.db.from("feedback").delete().eq("user_id", req.user));
  // Run res.json with the arguments below.
  res.json({ ok: true });
}); // Remove preferences and feedback while preserving conversations.
// Account deletion cascades through Supabase Postgres via Auth user foreign keys.

// Run app.delete with the arguments below.
app.delete("/api/account", async (req, res) => {
  // A server-only admin key is needed for full account deletion.
  await removeAccountLibraryFiles(req); // Remove user-owned binary objects before the auth-user cascade.
  const { error } = await supabase(undefined, true).auth.admin.deleteUser(
    // Supply this expression to the enclosing operation.
    req.user,
  // Close the current expression or block.
  );
  // Apply the following behavior only when its condition matches.
  if (error) throw error;
  // Run res.json with the arguments below.
  res.json({ ok: true });
}); // Delete the authenticated Auth user and cascade owned Postgres records.
// Run app.get with the arguments below.
app.get("/api/chats", async (req, res) =>
  // Run res.json with the arguments below.
  res.json(
    // Wait for this asynchronous operation before continuing.
    await result(
      // Supply this expression to the enclosing operation.
      req.db
        // Continue the current transformation.
        .from("chats")
        // Continue the current transformation.
        .select("id,title")
        // Continue the current transformation.
        .order("created_at", { ascending: false }),
    // Close the current expression or block.
    ),
  // Close the current expression or block.
  ),
); // List RLS-visible conversations.
// Run app.post with the arguments below.
app.post("/api/chats", async (req, res) => {
  // Initialize title for the current operation.
  const title = z
    // Continue the current transformation.
    .string()
    // Continue the current transformation.
    .min(1)
    // Continue the current transformation.
    .max(100)
    // Continue the current transformation.
    .parse(req.body.title || "New conversation");
  // Run res.json with the arguments below.
  res.json(
    // Wait for this asynchronous operation before continuing.
    await result(
      // Supply this expression to the enclosing operation.
      req.db
        // Continue the current transformation.
        .from("chats")
        // Continue the current transformation.
        .insert({ user_id: req.user, title })
        // Continue the current transformation.
        .select("id,title")
        // Continue the current transformation.
        .single(),
    // Close the current expression or block.
    ),
  // Close the current expression or block.
  );
}); // Create a user-owned conversation.
mountOrganisationRoutes(app, { result, getProfile, putProfile });
// Run app.param with the arguments below.
app.param("chat", async (req, res, next, id) => {
  // Apply the following behavior only when its condition matches.
  if (!z.string().uuid().safeParse(id).success)
    // Return the result to the calling operation.
    return res.status(404).json({ error: "Conversation not found." });
  // Initialize chat for the current operation.
  const chat = await result(
    // Run req.db.from with the arguments below.
    req.db.from("chats").select("id").eq("id", id).maybeSingle(),
  // Close the current expression or block.
  );
  // Apply the following behavior only when its condition matches.
  if (!chat) return res.status(404).json({ error: "Conversation not found." });
  // Run next with the arguments below.
  next();
}); // Enforce ownership through Postgres RLS before all chat routes.
// Run app.get with the arguments below.
app.get("/api/chats/:chat", async (req, res) => {
  // Supply this expression to the enclosing operation.
  const [messages, sources] = await Promise.all([
    // Run result with the arguments below.
    result(
      // Supply this expression to the enclosing operation.
      req.db
        // Continue the current transformation.
        .from("messages")
        // Continue the current transformation.
        .select("id,role,content")
        // Continue the current transformation.
        .eq("chat_id", req.params.chat)
        // Continue the current transformation.
        .order("created_at")
        // Continue the current transformation.
        .order("id"),
    // Close the current expression or block.
    ),
    // Run result with the arguments below.
    result(
      // Supply this expression to the enclosing operation.
      req.db
        // Continue the current transformation.
        .from("sources")
        // Continue the current transformation.
        .select("id,name,url,characters")
        // Continue the current transformation.
        .eq("chat_id", req.params.chat),
    // Close the current expression or block.
    ),
  // Close the current expression or block.
  ]);
  // Run res.json with the arguments below.
  res.json({ messages, sources });
}); // Load one chat's messages and evidence metadata.
// Run app.delete with the arguments below.
app.delete("/api/chats/:chat", async (req, res) => {
  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await result(req.db.from("chats").delete().eq("id", req.params.chat));
  // Run res.json with the arguments below.
  res.json({ ok: true });
}); // Delete a conversation and its sources through cascading foreign keys.
// Run app.delete with the arguments below.
app.delete("/api/chats/:chat/sources/:id", async (req, res) => {
  // Wait for this asynchronous operation before continuing.
  await result(
    // Supply this expression to the enclosing operation.
    req.db
      // Continue the current transformation.
      .from("sources")
      // Continue the current transformation.
      .delete()
      // Continue the current transformation.
      .eq("id", req.params.id)
      // Continue the current transformation.
      .eq("chat_id", req.params.chat),
  // Close the current expression or block.
  );
  // Run res.json with the arguments below.
  res.json({ ok: true });
}); // Remove only evidence belonging to the selected chat.
// Persist extracted evidence atomically with a per-chat source limit.
async function saveSource(req, name, text, url = "") {
  // Persist extracted evidence atomically with a per-chat source limit.
  // Initialize rows for the current operation.
  const rows = await result(
    // Run req.db.rpc with the arguments below.
    req.db.rpc("save_source", {
      // Set the p_chat option for this operation.
      p_chat: req.params.chat,
      // Set the p_name option for this operation.
      p_name: name.slice(0, 200),
      // Set the p_text option for this operation.
      p_text: text,
      // Set the p_url option for this operation.
      p_url: url,
    // Close the current expression or block.
    }),
  ); // Lock the chat while enforcing source count and ownership.
  return rows[0]; // Return source metadata without retransmitting all extracted text.
} // Finish evidence persistence.
// Direct document uploads. No Supabase Storage or Vercel is required.
// Raw bytes are parsed in the backend and discarded after extracting source text.
const MAX_UPLOAD = 12 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "docx", "pptx", "xlsx", "txt", "md", "csv", "vtt", "srt"]);
app.post(
  "/api/chats/:chat/file",
  express.raw({ type: "application/octet-stream", limit: "12mb" }),
  async (req, res) => {
    let name;
    try { name = decodeURIComponent(String(req.get("X-File-Name") || "")); }
    catch { return res.status(400).json({ error: "Invalid filename encoding." }); }
    if (/[\x00-\x1f\\/]/.test(name)) return res.status(400).json({error: "Invalid document name."});
    const extension = name.split(".").pop()?.toLowerCase();
    if (!name || name.length > 200 || !allowedExtensions.has(extension))
      return res.status(400).json({ error: "Choose a supported document or caption file." });
    if (!Buffer.isBuffer(req.body) || req.body.length < 1 || req.body.length > MAX_UPLOAD)
      return res.status(400).json({ error: "File must be between 1 byte and 12 MB." });
    // Check chat ownership before spending CPU on an untrusted document.
    const chat = await result(req.db.from("chats").select("id").eq("id", req.params.chat).maybeSingle());
    if (!chat) return res.status(404).json({ error: "Conversation not found." });
    const extracted = await extract(req.body, name);
    res.json(await saveSource(req, name, extracted));
  },
);
// Body parsers and input length caps limit memory use. Put this API behind an HTTPS reverse proxy.
app.post("/api/chats/:chat/text", async (req, res) => {
  // Initialize input for the current operation.
  const input = z
    // Continue the current transformation.
    .object({
      // Set the name option for this operation.
      name: z.string().min(1).max(200),
      // Set the text option for this operation.
      text: z.string().min(20).max(MAX_TEXT),
    // Close the current expression or block.
    })
    // Continue the current transformation.
    .parse(req.body);
  // Run res.json with the arguments below.
  res.json(await saveSource(req, input.name, input.text));
}); // Persist pasted notes or transcripts in Supabase.
// Run app.post with the arguments below.
app.post("/api/chats/:chat/link", async (req, res) => {
  // Initialize url for the current operation.
  const url = z.string().url().max(2048).parse(req.body.url);
  // Apply the following behavior only when its condition matches.
  if (/(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/i.test(new URL(url).hostname))
    // Return the result to the calling operation.
    return res
      // Continue the current transformation.
      .status(422)
      // Continue the current transformation.
      .json({
        // Set the error option for this operation.
        error:
          // Supply this literal value to the enclosing operation.
          "Paste the video transcript or upload VTT/SRT captions to summarize this video.",
      // Close the current expression or block.
      });
  // Initialize fetched for the current operation.
  const fetched = await fetchPublic(url);
  // Initialize filename for the current operation.
  const filename =
    // Run fetched.url.includes with the arguments below.
    fetched.url.includes("format=pptx") ||
    // Run fetched.type.includes with the arguments below.
    fetched.type.includes("presentationml")
      // Supply this expression to the enclosing operation.
      ? "slides.pptx"
      // Supply this expression to the enclosing operation.
      : fetched.url.includes("format=xlsx") ||
          // Run fetched.type.includes with the arguments below.
          fetched.type.includes("spreadsheetml")
        // Supply this expression to the enclosing operation.
        ? "sheet.xlsx"
        // Supply this expression to the enclosing operation.
        : new URL(fetched.url).pathname;
  // Run res.json with the arguments below.
  res.json(
    // Wait for this asynchronous operation before continuing.
    await saveSource(
      // Supply this expression to the enclosing operation.
      req,
      // Supply this expression to the enclosing operation.
      new URL(url).hostname,
      // Wait for this asynchronous operation before continuing.
      await extract(fetched.buffer, filename, fetched.type),
      // Supply this expression to the enclosing operation.
      url,
    // Close the current expression or block.
    ),
  // Close the current expression or block.
  );
}); // Fetch accessible public sources with existing SSRF protection.
// Initialize generation for the current operation.
const generation = z.object({
  // Set the question option for this operation.
  question: z.string().min(1).max(20000),
  // Set the style option for this operation.
  style: z.enum([
    // Supply this literal value to the enclosing operation.
    "Short summary",
    // Supply this literal value to the enclosing operation.
    "Detailed explanation",
    // Supply this literal value to the enclosing operation.
    "Bullet points",
    // Supply this literal value to the enclosing operation.
    "Step by step",
  // Close the current expression or block.
  ]),
  // Set the kind option for this operation.
  kind: z.enum([
    // Restrict AI tasks to supported types.
    "chat",
    // Restrict AI tasks to supported types.
    "summary",
    // Restrict AI tasks to supported types.
    "flashcards",
    // Restrict AI tasks to supported types.
    "textbook",
    // Restrict AI tasks to supported types.
    "slides",
    // Restrict AI tasks to supported types.
    "planner",
    // Restrict AI tasks to supported types.
    "review",
  // Close the current expression or block.
  ]),
}); // Restrict AI tasks to supported types.
// Run app.post with the arguments below.
app.post("/api/chats/:chat/ask", async (req, res) => {
  // Run a grounded request under a distributed database lease.
  const input = generation.parse(req.body); // Validate inputs before acquiring a lease.
  // Apply the following behavior only when its condition matches.
  if (!(await result(req.db.rpc("consume_budget", { p_kind: "ai" }))))
    // Return the result to the calling operation.
    return res
      // Enforce the AI budget across all function instances.
      .status(429)
      .json({ error: "AI request limit reached. Wait a minute." }); // Enforce the AI budget across all function instances.
  // Initialize lease for the current operation.
  const lease = await result(
    // Run req.db.rpc with the arguments below.
    req.db.rpc("claim_generation", { p_chat: req.params.chat }),
  ); // Atomically acquire a 150-second chat lease.
  // Apply the following behavior only when its condition matches.
  if (!lease)
    // Return the result to the calling operation.
    return res
      // Reject concurrent generations without in-memory locks.
      .status(409)
      .json({ error: "This conversation is already generating an answer." }); // Reject concurrent generations without in-memory locks.
  // Release the lease even when an upstream request fails.
  try {
    // Release the lease even when an upstream request fails.
    const profile = await getProfile(req); // Load current opt-in preferences from Supabase.
    // Supply this expression to the enclosing operation.
    const [rows, sources, feedback] = await Promise.all([
      // Run result with the arguments below.
      result(
        // Supply this expression to the enclosing operation.
        req.db
          // Continue the current transformation.
          .from("messages")
          // Continue the current transformation.
          .select("role,content")
          // Continue the current transformation.
          .eq("chat_id", req.params.chat)
          // Continue the current transformation.
          .order("created_at", { ascending: false })
          // Continue the current transformation.
          .order("id", { ascending: false })
          // Continue the current transformation.
          .limit(12),
      // Close the current expression or block.
      ),
      // Run result with the arguments below.
      result(
        // Supply this expression to the enclosing operation.
        req.db
          // Continue the current transformation.
          .from("sources")
          // Continue the current transformation.
          .select("id,name,text,url")
          // Continue the current transformation.
          .eq("chat_id", req.params.chat),
      // Close the current expression or block.
      ),
      // Supply this expression to the enclosing operation.
      profile.personalization
        // Supply this expression to the enclosing operation.
        ? result(
            // Supply this expression to the enclosing operation.
            req.db
              // Continue the current transformation.
              .from("feedback")
              // Continue the current transformation.
              .select("rating,note")
              // Continue the current transformation.
              .order("created_at", { ascending: false })
              // Continue the current transformation.
              .limit(5),
          // Close the current expression or block.
          )
        // Fetch only this user's chat evidence and optional feedback.
        : [],
    ]); // Fetch only this user's chat evidence and optional feedback.
    // Initialize history for the current operation.
    const history = rows.reverse().map((message) => {
      // Apply the following behavior only when its condition matches.
      if (message.role === "user") return message;
      // Supply this expression to the enclosing operation.
      try {
        // Initialize previous for the current operation.
        const previous = JSON.parse(message.content);
        // Return the result to the calling operation.
        return {
          // Set the role option for this operation.
          role: "assistant",
          // Set the content option for this operation.
          content: previous.artifact
            // Supply this expression to the enclosing operation.
            ? JSON.stringify(previous.artifact)
            // Supply this expression to the enclosing operation.
            : previous.content,
        // Close the current expression or block.
        };
      // Pass answer text instead of stored citation envelopes to DeepSeek.
      } catch {
        // Return the result to the calling operation.
        return message;
      // Close the current expression or block.
      }
    }); // Pass answer text instead of stored citation envelopes to DeepSeek.
    // Initialize output for the current operation.
    const output = await answer({
      // Generate a grounded answer using the existing DeepSeek integration.
      ...input,
      // Generate a grounded answer using the existing DeepSeek integration.
      history,
      // Generate a grounded answer using the existing DeepSeek integration.
      sources,
      // Generate a grounded answer using the existing DeepSeek integration.
      profile,
      // Generate a grounded answer using the existing DeepSeek integration.
      feedback,
    // Close the current expression or block.
    });
    output.kind = input.kind; // Generate a grounded answer using the existing DeepSeek integration.
    // Apply the following behavior only when its condition matches.
    if (output.artifact)
      // Run output.artifact.sections.push with the arguments below.
      output.artifact.sections.push({
        // Set the heading option for this operation.
        heading: "Source references",
        // Set the body option for this operation.
        body: output.citations
          // Continue the current transformation.
          .map(
            // Supply this expression to the enclosing operation.
            (c) =>
              // Supply this expression to the enclosing operation.
              `[${c.label}] ${c.name}, passage ${c.passage}${c.url ? " — " + c.url : ""}`,
          // Close the current expression or block.
          )
          // Keep references in exported material.
          .join("\n"),
      }); // Keep references in exported material.
    // Initialize ids for the current operation.
    const ids = await result(
      // Run req.db.rpc with the arguments below.
      req.db.rpc("finish_generation", {
        // Set the p_chat option for this operation.
        p_chat: req.params.chat,
        // Set the p_lease option for this operation.
        p_lease: lease,
        // Set the p_question option for this operation.
        p_question: input.question,
        // Set the p_answer option for this operation.
        p_answer: JSON.stringify(output),
      // Close the current expression or block.
      }),
    ); // Commit the two messages atomically and release this lease.
    // Apply the following behavior only when its condition matches.
    if (profile.personalization) {
      // Initialize topics for the current operation.
      const topics = {
        // Set the cybersecurity option for this operation.
        cybersecurity: /security|network|ctf|malware/i,
        // Set the programming option for this operation.
        programming: /code|python|javascript|web/i,
        // Set the biology option for this operation.
        biology: /brain|biology|neuron|cell|eeg/i,
        // Set the mathematics option for this operation.
        mathematics: /math|equation|algebra/i,
        // Set the learning option for this operation.
        learning: /study|recall|learn/i,
      // Close the current expression or block.
      };
      // Supply this expression to the enclosing operation.
      profile.frequentSubjects ||= {};
      // Supply this expression to the enclosing operation.
      for (const [topic, pattern] of Object.entries(topics))
        // Apply the following behavior only when its condition matches.
        if (pattern.test(input.question))
          // Supply this expression to the enclosing operation.
          profile.frequentSubjects[topic] =
            // Supply this expression to the enclosing operation.
            (profile.frequentSubjects[topic] || 0) + 1;
      // Supply this expression to the enclosing operation.
      profile.lastStyle = input.style;
      // Supply this expression to the enclosing operation.
      try {
        // Wait for this asynchronous operation before continuing.
        await putProfile(req, profile);
      // Supply this expression to the enclosing operation.
      } catch {
        // Supply this expression to the enclosing operation.
        output.memoryWarning =
          // Supply this literal value to the enclosing operation.
          "Answer saved, but preference memory could not be updated.";
      // Close the current expression or block.
      }
    } // Keep preference failure from discarding an already saved answer.
    if (output.artifact) {
      try {
        output.libraryItem = await saveGeneratedItem(req, output.artifact, input.kind, req.params.chat);
      } catch (libraryError) {
        console.warn('StudySpace library autosave failed:', libraryError.message);
        output.libraryWarning = 'Your material is saved in chat, but could not be indexed in Library. Apply migration 002 and retry.';
      }
    }
    res.json({ ...output, id: ids.assistant_id, userId: ids.user_id }); // Return persisted identifiers for feedback.
  // Avoid clearing another invocation's lease.
  } finally {
    // Wait for this asynchronous operation before continuing.
    await result(
      // Run req.db.rpc with the arguments below.
      req.db.rpc("release_generation", {
        // Set the p_chat option for this operation.
        p_chat: req.params.chat,
        // Set the p_lease option for this operation.
        p_lease: lease,
      // Close the current expression or block.
      }),
    // Avoid clearing another invocation's lease.
    ).catch(() => {});
  } // Avoid clearing another invocation's lease.
}); // Finish generation routing.
// Run app.post with the arguments below.
app.post("/api/feedback", async (req, res) => {
  // Initialize input for the current operation.
  const input = z
    // Continue the current transformation.
    .object({
      // Set the message option for this operation.
      message: z.string().uuid(),
      // Set the rating option for this operation.
      rating: z.enum(["helpful", "needs-work"]),
      // Set the note option for this operation.
      note: z.string().max(600),
    // Close the current expression or block.
    })
    // Continue the current transformation.
    .parse(req.body);
  // Initialize message for the current operation.
  const message = await result(
    // Supply this expression to the enclosing operation.
    req.db
      // Continue the current transformation.
      .from("messages")
      // Continue the current transformation.
      .select("id")
      // Continue the current transformation.
      .eq("id", input.message)
      // Continue the current transformation.
      .eq("role", "assistant")
      // Continue the current transformation.
      .maybeSingle(),
  // Close the current expression or block.
  );
  // Apply the following behavior only when its condition matches.
  if (!message) return res.status(404).json({ error: "Answer not found." });
  // Wait for this asynchronous operation before continuing.
  await result(
    // Supply this expression to the enclosing operation.
    req.db
      // Continue the current transformation.
      .from("feedback")
      // Continue the current transformation.
      .upsert({
        // Set the message_id option for this operation.
        message_id: input.message,
        // Set the user_id option for this operation.
        user_id: req.user,
        // Set the rating option for this operation.
        rating: input.rating,
        // Set the note option for this operation.
        note: input.note,
      // Close the current expression or block.
      }),
  // Close the current expression or block.
  );
  // Run res.json with the arguments below.
  res.json({ ok: true });
}); // Attach specific feedback to an owned assistant answer.
// Run app.post with the arguments below.
app.post("/api/achievements", async (req, res) => {
  // Initialize goal for the current operation.
  const goal = z
    // Continue the current transformation.
    .enum(["first-review", "five-cards", "study-plan"])
    // Continue the current transformation.
    .parse(req.body.goal);
  // Apply the following behavior only when its condition matches.
  if (!(await getProfile(req)).achievements)
    // Return the result to the calling operation.
    return res
      // Continue the current transformation.
      .status(400)
      // Continue the current transformation.
      .json({ error: "Enable optional achievements first." });
  // Wait for this asynchronous operation before continuing.
  await result(
    // Supply this expression to the enclosing operation.
    req.db
      // Continue the current transformation.
      .from("achievements")
      // Continue the current transformation.
      .upsert(
        // Supply this expression to the enclosing operation.
        { user_id: req.user, goal },
        // Supply this expression to the enclosing operation.
        { onConflict: "user_id,goal", ignoreDuplicates: true },
      // Close the current expression or block.
      ),
  // Close the current expression or block.
  );
  // Run res.json with the arguments below.
  res.json({
    // Set the goals option for this operation.
    goals: (await result(req.db.from("achievements").select("goal"))).map(
      // Supply this expression to the enclosing operation.
      (row) => row.goal,
    // Close the current expression or block.
    ),
  // Close the current expression or block.
  });
}); // Persist one copy of each optional milestone.
// Run app.post with the arguments below.
app.post("/api/export", async (req, res) => {
  // Initialize format for the current operation.
  const format = z.enum(["docx", "pptx", "pdf"]).parse(req.body.format);
  if (format === "pptx") {
    return res.status(501).json({
      error: "PowerPoint export is paused for this demo. Download Word or PDF instead.",
      code: "FEATURE_NOT_ENABLED"
    });
  }
  // Initialize output for the current operation.
  const output = await exportArtifact(req.body.artifact, format);
  // Apply the following behavior only when its condition matches.
  if (output.buffer.length > 4 * 1024 * 1024)
    // Return the result to the calling operation.
    return res
      // Continue the current transformation.
      .status(413)
      // Continue the current transformation.
      .json({
        // Set the error option for this operation.
        error:
          // Supply this literal value to the enclosing operation.
          "This export exceeds the backend response budget. Export a smaller section.",
      // Close the current expression or block.
      });
  // Exported office files are separate private Library items; saving should never block the download.
  let savedToLibrary = 'saved';
  try { await saveExportItem(req, req.body.artifact, format, output); }
  catch (error) {
    savedToLibrary = 'failed';
    console.warn('Could not save StudySpace export to Library:', error.message);
  }
  // Supply this expression to the enclosing operation.
  res
    // Continue the current transformation.
    .set({
      // Set the Content-Type option for this operation.
      "Content-Type": output.mime,
      "X-StudySpace-Library": savedToLibrary,
      // Set the Content-Disposition option for this operation.
      "Content-Disposition": `attachment; filename="StudySpace.${format}"`,
    // Close the current expression or block.
    })
    // Keep generated downloads within the backend's response limit.
    .send(output.buffer);
}); // Keep generated downloads within the backend's response limit.
// Run app.use with the arguments below.
app.use((error, _req, res, _next) => {
  if (res.headersSent) return;
  const validation = error instanceof z.ZodError || error?.type === 'entity.parse.failed';
  const status = validation ? 400 :
    error?.type === 'entity.too.large' ? 413 :
    Number.isInteger(error?.status) && error.status >= 400 && (error.status < 500 || error.status === 503) ? error.status : 500;
  if (status >= 500) console.error('[StudySpace API]', error?.name || 'Error', error?.message || 'Unknown failure');
  // Never send stack traces, Supabase queries, token contents or raw provider errors to production clients.
  const safeClientError = {
    400: 'Please check the submitted information.',
    401: 'Please sign in again.',
    403: 'This action is not permitted.',
    404: 'The requested item was not found.',
    409: 'The request conflicts with the current state.',
    413: 'The uploaded content is too large.',
    429: 'Too many requests. Please try again shortly.',
  };
  const message = process.env.APP_ENV === 'production'
    ? (safeClientError[status] || 'We could not complete that request. Please try again.')
    : (validation ? 'Please check the request fields.' : String(error?.message || 'Request failed.').slice(0, 240));
  res.status(status).json({ error: message });
});
export default app;
