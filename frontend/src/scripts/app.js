import { initStudyBuddyStudio } from "./studybuddy-studio.js";
import * as Y from "yjs"; // Keep editable drafts in a conflict-safe local document.
import { IndexeddbPersistence } from "y-indexeddb"; // Persist Yjs updates across offline reloads.
import { marked } from "marked"; // Render readable Markdown answers.
import DOMPurify from "dompurify"; // Sanitize model and source text before HTML rendering.
// Import the module dependencies used below.
// Import the module dependencies used below.
import {
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  createIcons,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Plus,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  MessagesSquare,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Files,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  GraduationCap,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Library,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Clock3,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  SlidersHorizontal,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  ChevronsUpDown,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  PanelRight,
  Menu,
  X,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  ScanText,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Lightbulb,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Layers,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  ArrowUpRight,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  ShieldCheck,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Paperclip,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  ArrowUp,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  CloudUpload,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  MessageSquareHeart,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Video,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Info,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  BookOpen,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Presentation,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  CalendarDays,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  Search,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  FileText,
  // Import only the icons used by this interface.
  // Import only the icons used by this interface.
  LockKeyhole,
} from "lucide"; // Import only the icons used by this interface.
// Initialize icons for the current operation.
// Initialize icons for the current operation.
const icons = {
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Plus,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  MessagesSquare,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Files,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  GraduationCap,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Library,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Clock3,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  SlidersHorizontal,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  ChevronsUpDown,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  PanelRight,
  Menu,
  X,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  ScanText,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Lightbulb,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Layers,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  ArrowUpRight,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  ShieldCheck,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Paperclip,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  ArrowUp,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  CloudUpload,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  MessageSquareHeart,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Video,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Info,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  BookOpen,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Presentation,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  CalendarDays,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  Search,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  FileText,
  // Register the tree-shakable icon set.
  // Register the tree-shakable icon set.
  LockKeyhole,
}; // Register the tree-shakable icon set.
createIcons({ icons }); // Replace static icon placeholders once.
const $ = (id) => document.getElementById(id); // Keep DOM lookups short and readable.
// Initialize element for the current operation.
// Initialize element for the current operation.
const element = (tag, className, text) => {
  // Initialize node for the current operation.
  // Initialize node for the current operation.
  const node = document.createElement(tag);
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (className) node.className = className;
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (text !== undefined) node.textContent = text;
  // Return the result to the calling operation.
  // Return the result to the calling operation.
  return node;
}; // Create safe elements without interpolating untrusted HTML.
// Initialize markdown for the current operation.
// Initialize markdown for the current operation.
const markdown = (text) =>
  DOMPurify.sanitize(marked.parse(text), { USE_PROFILES: { html: true } }); // Allow safe formatting while stripping scripts and unsafe URLs.
// Browsers with blocked persistence should still support a safe in-memory preview.
const safeLocal = {
  getItem(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
  setItem(key,value) { try { window.localStorage.setItem(key,value); } catch {} },
  removeItem(key) { try { window.localStorage.removeItem(key); } catch {} },
};
const safeSession = {
  getItem(key) { try { return window.sessionStorage.getItem(key); } catch { return null; } },
  setItem(key,value) { try { window.sessionStorage.setItem(key,value); } catch {} },
  removeItem(key) { try { window.sessionStorage.removeItem(key); } catch {} },
};
// Initialize origin for the current operation.
// Initialize origin for the current operation.
// Build-time environment isolation. Never share browser sessions across environments.
const APP_ENV = import.meta.env.PUBLIC_APP_ENV === "production" ? "production" : "testbed";
const expectedApi = (import.meta.env.PUBLIC_API_URL || "").replace(/\/$/, "");
const modeBadge = document.getElementById("environment-badge");
if (modeBadge) { modeBadge.textContent = APP_ENV === "production" ? "PRODUCTION" : "TESTBED"; modeBadge.dataset.mode = APP_ENV; }
// Never fall back to an old browser-stored API URL. The static deployment
// explicitly pins the backend origin to avoid environment/account mix-ups.
let origin = expectedApi;
let token = safeSession.getItem(`studyspace-${APP_ENV}-token`) || ""; // Keep the short-lived API credential in the current browser session.
let username = safeSession.getItem(`studyspace-${APP_ENV}-user`) || "guest"; // Scope offline data to the signed-in account.
// Initialize chatId for the current operation.
// Initialize chatId for the current operation.
let chatId = "";
// Initialize chats for the current operation.
// Initialize chats for the current operation.
let chats = [];
// Initialize sources for the current operation.
// Initialize sources for the current operation.
let sources = [];
// Initialize profile for the current operation.
// Initialize profile for the current operation.
let profile = {};
// Initialize busy for the current operation.
// Initialize busy for the current operation.
let busy = false;
// Initialize currentArtifact for the current operation.
// Initialize currentArtifact for the current operation.
let currentArtifact = null;
// Initialize artifactKind for the current operation.
// Initialize artifactKind for the current operation.
let artifactKind = "";
let toastTimer; // Track the current workspace state.
// Initialize ydoc for the current operation.
// Initialize ydoc for the current operation.
let ydoc;
// Initialize persistence for the current operation.
// Initialize persistence for the current operation.
let persistence;
// Initialize drafts for the current operation.
// Initialize drafts for the current operation.
let drafts;
let snapshots; // Hold the currently selected account's offline buffers.
// Open an account-specific IndexedDB document.
// Open an account-specific IndexedDB document.
async function openBuffer() {
  // Open an account-specific IndexedDB document.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (persistence) {
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await persistence.destroy();
    // Run ydoc.destroy with the arguments below.
    // Run ydoc.destroy with the arguments below.
    ydoc.destroy();
  } // Release the previous account's database connection.
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  ydoc = new Y.Doc();
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  persistence = new IndexeddbPersistence(
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    `studyspace-v1:${origin}:${username}`,
    // Supply this expression to the enclosing operation.
    // Close the current expression or block.
    ydoc,
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Separate drafts and cached chat snapshots by account and API.
  // Separate drafts and cached chat snapshots by account and API.
  drafts = ydoc.getMap("drafts");
  snapshots = ydoc.getMap("snapshots"); // Separate drafts and cached chat snapshots by account and API.
  try { await persistence.whenSynced; }
  catch {
    // Private mode can disable IndexedDB; keep this session usable in memory.
    try { await persistence.destroy(); } catch {}
    persistence = null;
    console.info('StudyBuddy: persistent drafts unavailable; using memory until this tab closes.');
  }
  $("question").value = drafts.get(chatId || "new") || ""; // Restore the current unsent draft.
} // Finish buffer initialization.
// Announce concise status changes without blocking work.
// Announce concise status changes without blocking work.
function toast(message) {
  // Announce concise status changes without blocking work.
  // Run clearTimeout with the arguments below.
  // Run clearTimeout with the arguments below.
  clearTimeout(toastTimer);
  const dialog = document.querySelector("dialog[open]"); // Keep errors readable above the modal backdrop.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (dialog) {
    // Initialize status for the current operation.
    // Initialize status for the current operation.
    let status = dialog.querySelector(".dialog-status");
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (!status) {
      // Supply this expression to the enclosing operation.
      // Run status.setAttribute with the arguments below.
      status = element("p", "dialog-status");
      // Run status.setAttribute with the arguments below.
      // Run status.setAttribute with the arguments below.
      status.setAttribute("role", "status");
      // Run dialog.append with the arguments below.
      // Run dialog.append with the arguments below.
      dialog.append(status);
      // Close the current expression or block.
    // Close the current expression or block.
    }
    // Mirror status inside the active dialog.
    // Mirror status inside the active dialog.
    status.textContent = message;
  } // Mirror status inside the active dialog.
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("toast").textContent = message;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("toast").hidden = false;
  toastTimer = setTimeout(() => ($("toast").hidden = true), 8000); // Show a timed accessible notification.
} // Finish status notification.
// Initialize handle for the current operation.
// Initialize handle for the current operation.
const handle = (task) => async (event) => {
  // Supply this expression to the enclosing operation.
  // Wait for this asynchronous operation before continuing.
  try {
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await task(event);
    // Supply this expression to the enclosing operation.
  // Run toast with the arguments below.
  } catch (error) {
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast(error.message);
    // Close the current expression or block.
  // Close the current expression or block.
  }
}; // Route async UI failures into readable status messages.
// Update connection copy without replacing the status dot.
// Run $ with the arguments below.
function setConnection(text) {
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("connection").lastChild.textContent = ` ${text}`;
} // Update connection copy without replacing the status dot.
// Make authenticated calls to the independent server.
let refreshToken = safeSession.getItem(`studyspace-${APP_ENV}-refresh`) || ""; // Keep the refresh credential in this tab's session storage.
let expiresAt = Number(safeSession.getItem(`studyspace-${APP_ENV}-expiry`) || 0); // Track access-token expiry without trusting it for authorization.
let refreshing; // Share one refresh operation among concurrent client requests.
// Store both rotated Supabase credentials together.
function saveSession(data) {
  // Store both rotated Supabase credentials together.
  // Supply this expression to the enclosing operation.
  token = data.token;
  // Replace expired credentials in memory.
  refreshToken = data.refreshToken;
  expiresAt = data.expiresAt; // Replace expired credentials in memory.
  // Run safeSession.setItem with the arguments below.
  safeSession.setItem(`studyspace-${APP_ENV}-token`, token);
  // Run safeSession.setItem with the arguments below.
  safeSession.setItem(`studyspace-${APP_ENV}-refresh`, refreshToken);
  safeSession.setItem(`studyspace-${APP_ENV}-expiry`, String(expiresAt)); // Persist the current tab's renewable session.
} // Finish session persistence.
// Refresh without creating competing token-rotation requests.
async function renewSession() {
  // Refresh without creating competing token-rotation requests.
  if (!refreshToken) throw new Error("Your session expired. Sign in again."); // Reject old local-server sessions cleanly.
  // Apply the following behavior only when its condition matches.
  if (!refreshing)
    // Ask backend to renew the session through Supabase Auth.
    refreshing = (async () => {
      // Initialize response for the current operation.
      const response = await fetch(`${origin}/api/refresh`, {
        // Set the method option for this operation.
        method: "POST",
        // Set the headers option for this operation.
        headers: { "Content-Type": "application/json", "X-StudyBuddy-Environment": APP_ENV },
        // Set the body option for this operation.
        body: JSON.stringify({ refreshToken }),
        // Set the signal option for this operation.
        signal: AbortSignal.timeout(30000),
      // Close the current expression or block.
      });
      // Initialize data for the current operation.
      const data = await response.json();
      // Apply the following behavior only when its condition matches.
      if (!response.ok) throw new Error(data.error || "Please sign in again.");
      // Run saveSession with the arguments below.
      saveSession(data);
    })(); // Ask backend to renew the session through Supabase Auth.
  // Supply this expression to the enclosing operation.
  try {
    // Wait for this asynchronous operation before continuing.
    await refreshing;
  // Supply this expression to the enclosing operation.
  } finally {
    // Unlock refresh after success or failure.
    refreshing = undefined;
  } // Unlock refresh after success or failure.
} // Finish token refresh.
// Call the independently deployed backend API.
async function api(path, options = {}) {
  // Call the independently deployed backend API.
  // Apply the following behavior only when its condition matches.
  if (!origin || !token) {
    // Run $ with the arguments below.
    $("account-dialog").showModal();
    // Stop this operation with a clear failure.
    throw new Error("Connect and sign in to your backend first.");
  } // Keep unconfigured preview states explicit.
  // Apply the following behavior only when its condition matches.
  if (!navigator.onLine)
    // Stop this operation with a clear failure.
    throw new Error(
      // Preserve offline drafts without attempting remote work.
      "You’re offline. Your draft is saved; send it after reconnecting.",
    ); // Preserve offline drafts without attempting remote work.
  if (expiresAt && expiresAt * 1000 < Date.now() + 180000) await renewSession(); // Renew soon-expiring access tokens proactively.
  // Initialize send for the current operation.
  const send = () =>
    // Run fetch with the arguments below.
    fetch(`${origin}/api${path}`, {
      // Bound the client request below the deployment's request budget.
      ...options,
      // Set the headers option for this operation.
      headers: {
        // Set the Content-Type option for this operation.
        "Content-Type": "application/json",
        // Set the Authorization option for this operation.
        Authorization: `Bearer ${token}`,
        "X-StudyBuddy-Environment": APP_ENV,
        // Continue the current transformation.
        ...options.headers,
      // Close the current expression or block.
      },
      // Set the signal option for this operation.
      signal: AbortSignal.timeout(115000),
    }); // Bound the client request below the deployment's request budget.
  let response = await send(); // Send the user's deliberate action once.
  // Apply the following behavior only when its condition matches.
  if (response.status === 401 && refreshToken) {
    // Wait for this asynchronous operation before continuing.
    await renewSession();
    // Retry only authentication failures after rotating credentials.
    response = await send();
  } // Retry only authentication failures after rotating credentials.
  // Apply the following behavior only when its condition matches.
  if (!response.ok) {
    // Initialize data for the current operation.
    const data = await response
      // Continue the current transformation.
      .json()
      // Continue the current transformation.
      .catch(() => ({
        // Set the error option for this operation.
        error: `API request failed (${response.status}). Check the backend API origin and deployment.`,
      // Close the current expression or block.
      }));
    // Stop this operation with a clear failure.
    throw new Error(data.error);
  } // Avoid trying to parse backend HTML errors as successful JSON.
  return options.binary ? response.blob() : response.json(); // Support structured responses and generated downloads.
} // Finish API request handling.
// Switch workspace areas while preserving chat state.
// Switch workspace areas while preserving chat state.
function changeTab(tab) {
  // Switch workspace areas while preserving chat state.
  // Supply this expression to the enclosing operation.
  // Continue the current transformation.
  document
    // Continue the current transformation.
    // Continue the current transformation.
    .querySelectorAll(".tab")
    // Continue the current transformation.
    // Run node.classList.toggle with the arguments below.
    .forEach((node) =>
      // Run node.classList.toggle with the arguments below.
      // Run node.classList.toggle with the arguments below.
      node.classList.toggle("active", node.id === `tab-${tab}`),
    ); // Show the requested panel.
  // Supply this expression to the enclosing operation.
  // Continue the current transformation.
  document
    // Continue the current transformation.
    // Continue the current transformation.
    .querySelectorAll("[data-tab]")
    // Continue the current transformation.
    // Run node.classList.toggle with the arguments below.
    .forEach((node) =>
      // Run node.classList.toggle with the arguments below.
      // Run node.classList.toggle with the arguments below.
      node.classList.toggle("active", node.dataset.tab === tab),
    ); // Highlight the matching navigation action.
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("page-name").textContent = {
    // Set the chat option for this operation.
    // Set the chat option for this operation.
    chat: "Chat",
    // Set the documents option for this operation.
    // Set the documents option for this operation.
    documents: "Documents",
    // Set the study option for this operation.
    // Set the study option for this operation.
    study: "Study tools",
    // Set the resources option for this operation.
    // Set the resources option for this operation.
    resources: "Resource hub",
    library: "My library",
    word: "Word studio",
    slides: "Slide studio",
    flashcards: "Flashcards",
  }[tab]; // Update the breadcrumb.
  document.querySelectorAll('[data-tab]').forEach((button) => {
    if (button.dataset.tab === tab) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  closeDrawers(); // Selecting a destination dismisses off-canvas navigation.
  if (tab === "library") void loadLibrary().catch(error => toast(error.message));
} // Finish tab navigation.
// Supply this expression to the enclosing operation.
// Continue the current transformation.
document
  // Continue the current transformation.
  // Continue the current transformation.
  .querySelectorAll("[data-tab],[data-go]")
  // Continue the current transformation.
  // Run button.addEventListener with the arguments below.
  .forEach((button) =>
    // Run button.addEventListener with the arguments below.
    // Run button.addEventListener with the arguments below.
    button.addEventListener(
      // Run changeTab with the arguments below.
      "click",
      // Run changeTab with the arguments below.
      () =>
        // Run changeTab with the arguments below.
        // Run changeTab with the arguments below.
        changeTab(button.dataset.tab || button.dataset.go),
      // Close the current expression or block.
    // Close the current expression or block.
    ),
  ); // Connect primary navigation and quick shortcuts.
// Run document.querySelectorAll with the arguments below.
// Run document.querySelectorAll with the arguments below.
document.querySelectorAll("[data-prompt]").forEach((button) =>
  // Run button.addEventListener with the arguments below.
  // Run button.addEventListener with the arguments below.
  button.addEventListener("click", () => {
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("question").value = button.dataset.prompt;
    // Run saveDraft with the arguments below.
    // Run saveDraft with the arguments below.
    saveDraft();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("question").focus();
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Prefill useful questions without sending automatically.
// Persist each text change to the account's offline buffer.
// Supply this expression to the enclosing operation.
function saveDraft() {
  // Supply this expression to the enclosing operation.
  // Run $ with the arguments below.
  drafts?.set(chatId || "new", $("question").value);
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("draft-status").textContent = "Draft saved on this device · Yjs";
} // Persist each text change to the account's offline buffer.
$("question").addEventListener("input", saveDraft); // Buffer edits while typing.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("question").addEventListener("keydown", (event) => {
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("chat-form").requestSubmit();
    // Close the current expression or block.
  // Close the current expression or block.
  }
}); // Support Enter to submit and Shift+Enter for newlines.
// Draw the current account's conversation navigation.
// Draw the current account's conversation navigation.
function renderChats() {
  // Draw the current account's conversation navigation.
  $("chat-list").replaceChildren(); // Remove previously rendered account history.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (!chats.length)
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("chat-list").append(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element(
        // Show a helpful empty state.
        // Show a helpful empty state.
        "p",
        // Show a helpful empty state.
        // Show a helpful empty state.
        "muted small",
        // Show a helpful empty state.
        // Close the current expression or block.
        "No conversations yet. Start with a question or a source.",
        // Close the current expression or block.
      // Close the current expression or block.
      ),
    ); // Show a helpful empty state.
  // Run chats.forEach with the arguments below.
  // Run chats.forEach with the arguments below.
  chats.forEach((chat) => {
    // Initialize button for the current operation.
    // Initialize button for the current operation.
    const button = element(
      // Supply this literal value to the enclosing operation.
      // Supply this expression to the enclosing operation.
      "button",
      // Supply this expression to the enclosing operation.
      // Supply this expression to the enclosing operation.
      chat.id === chatId ? "active" : "",
      // Supply this expression to the enclosing operation.
      // Close the current expression or block.
      chat.title,
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Run button.addEventListener with the arguments below.
    // Run button.addEventListener with the arguments below.
    button.addEventListener(
      // Supply this literal value to the enclosing operation.
      // Run handle with the arguments below.
      "click",
      // Run handle with the arguments below.
      // Run handle with the arguments below.
      handle(() => loadChat(chat.id)),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("chat-list").append(button);
  }); // Attach ownership-scoped chat navigation.
  window.dispatchEvent(new CustomEvent("studybuddy:chats-rendered"));
} // Finish history rendering.
// Cache the history index for offline navigation.
// Supply this expression to the enclosing operation.
async function refreshChats() {
  // Supply this expression to the enclosing operation.
  // Run snapshots.set with the arguments below.
  chats = await api("/chats");
  // Run snapshots.set with the arguments below.
  // Run snapshots.set with the arguments below.
  snapshots.set("chat-list", chats);
  // Run renderChats with the arguments below.
  // Run renderChats with the arguments below.
  renderChats();
} // Cache the history index for offline navigation.
// Create a conversation lazily when the first real action needs one.
// Create a conversation lazily when the first real action needs one.
async function ensureChat() {
  // Create a conversation lazily when the first real action needs one.
  if (chatId) return chatId; // Reuse the selected isolated conversation.
  // Initialize chat for the current operation.
  // Initialize chat for the current operation.
  const chat = await api("/chats", {
    // Set the method option for this operation.
    // Set the method option for this operation.
    method: "POST",
    // Set the body option for this operation.
    // Set the body option for this operation.
    body: JSON.stringify({ title: "New conversation" }),
  }); // Create a new server conversation.
  // Supply this expression to the enclosing operation.
  // Apply the following behavior only when its condition matches.
  chatId = chat.id;
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (drafts.get("new")) {
    // Run drafts.set with the arguments below.
    // Run drafts.set with the arguments below.
    drafts.set(chatId, drafts.get("new"));
    // Run drafts.delete with the arguments below.
    // Run drafts.delete with the arguments below.
    drafts.delete("new");
  } // Move the unsent draft into the new conversation.
  // Run chats.unshift with the arguments below.
  // Run chats.unshift with the arguments below.
  chats.unshift(chat);
  // Supply this expression to the enclosing operation.
  // Run renderChats with the arguments below.
  sources = [];
  // Run renderChats with the arguments below.
  // Run renderChats with the arguments below.
  renderChats();
  // Run renderSources with the arguments below.
  // Run renderSources with the arguments below.
  renderSources();
  return chatId; // Update navigation and evidence state.
} // Finish lazy conversation creation.
// Restore one conversation and its evidence.
// Restore one conversation and its evidence.
async function loadChat(id) {
  // Restore one conversation and its evidence.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (busy)
    // Stop this operation with a clear failure.
    // Stop this operation with a clear failure.
    throw new Error(
      // Avoid placing responses into another chat.
      // Avoid placing responses into another chat.
      "Wait for the current answer before switching conversations.",
    ); // Avoid placing responses into another chat.
  // Run saveDraft with the arguments below.
  // Run saveDraft with the arguments below.
  saveDraft();
  const data = navigator.onLine ? await api(`/chats/${id}`) : snapshots.get(id); // Prefer fresh server data while allowing offline reads.
  if (!data) throw new Error("This conversation is not cached on this device."); // Explain missing offline history.
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  chatId = id;
  // Supply this expression to the enclosing operation.
  // Run snapshots.set with the arguments below.
  sources = data.sources;
  // Run snapshots.set with the arguments below.
  // Run snapshots.set with the arguments below.
  snapshots.set(id, data);
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("messages").replaceChildren();
  $("welcome").hidden = Boolean(data.messages.length); // Restore only the selected chat's evidence and messages.
  // Run data.messages.forEach with the arguments below.
  // Run data.messages.forEach with the arguments below.
  data.messages.forEach((message) => {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (message.role === "user") renderUser(message.content);
    // Handle the alternative case.
    // Handle the alternative case.
    else {
      // Supply this expression to the enclosing operation.
      // Run renderAnswer with the arguments below.
      try {
        // Run renderAnswer with the arguments below.
        // Run renderAnswer with the arguments below.
        renderAnswer(JSON.parse(message.content), message.id);
        // Supply this expression to the enclosing operation.
      // Run renderAnswer with the arguments below.
      } catch {
        // Run renderAnswer with the arguments below.
        // Run renderAnswer with the arguments below.
        renderAnswer({ content: message.content, citations: [] }, message.id);
        // Close the current expression or block.
      // Close the current expression or block.
      }
      // Close the current expression or block.
    // Close the current expression or block.
    }
  }); // Render stored answers with their original citations.
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("question").value = drafts.get(id) || "";
  // Run renderChats with the arguments below.
  // Run renderChats with the arguments below.
  renderChats();
  // Run renderSources with the arguments below.
  // Run renderSources with the arguments below.
  renderSources();
  changeTab("chat"); // Restore the conversation-specific draft.
} // Finish chat restoration.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("new-chat").addEventListener(
  // Reset the visible chat without leaking prior context.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async () => {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (busy)
      // Stop this operation with a clear failure.
      // Stop this operation with a clear failure.
      throw new Error(
        // Supply this literal value to the enclosing operation.
        // Close the current expression or block.
        "Wait for the current answer before starting another chat.",
        // Close the current expression or block.
      // Close the current expression or block.
      );
    // Run saveDraft with the arguments below.
    // Run saveDraft with the arguments below.
    saveDraft();
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    chatId = "";
    // Supply this expression to the enclosing operation.
    // Run $ with the arguments below.
    sources = [];
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("messages").replaceChildren();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("welcome").hidden = false;
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("question").value = drafts.get("new") || "";
    // Run renderChats with the arguments below.
    // Run renderChats with the arguments below.
    renderChats();
    // Run renderSources with the arguments below.
    // Run renderSources with the arguments below.
    renderSources();
    // Run changeTab with the arguments below.
    // Run changeTab with the arguments below.
    changeTab("chat");
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("question").focus();
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Reset the visible chat without leaking prior context.
// Show only sources attached to the current conversation.
// Show only sources attached to the current conversation.
function renderSources() {
  // Show only sources attached to the current conversation.
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("source-list").replaceChildren();
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("source-count").textContent = String(sources.length);
  $("source-empty").hidden = Boolean(sources.length); // Synchronize source counts and empty state.
  // Run sources.forEach with the arguments below.
  // Run sources.forEach with the arguments below.
  sources.forEach((source) => {
    // Initialize row for the current operation.
    // Initialize row for the current operation.
    const row = element("div", "source-item");
    // Initialize label for the current operation.
    // Initialize label for the current operation.
    const label = element("span", "", source.name);
    // Supply this expression to the enclosing operation.
    // Run label.append with the arguments below.
    label.title = source.name;
    // Run label.append with the arguments below.
    // Run label.append with the arguments below.
    label.append(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element(
        // Supply this literal value to the enclosing operation.
        // Supply this literal value to the enclosing operation.
        "small",
        // Supply this literal value to the enclosing operation.
        // Supply this expression to the enclosing operation.
        "",
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        `${Number(source.characters).toLocaleString()} characters · this chat`,
        // Close the current expression or block.
      // Close the current expression or block.
      ),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Initialize remove for the current operation.
    // Initialize remove for the current operation.
    const remove = element("button", "", "×");
    // Run remove.setAttribute with the arguments below.
    // Run remove.setAttribute with the arguments below.
    remove.setAttribute("aria-label", `Remove ${source.name}`);
    // Run remove.addEventListener with the arguments below.
    // Run remove.addEventListener with the arguments below.
    remove.addEventListener(
      // Supply this literal value to the enclosing operation.
      // Run handle with the arguments below.
      "click",
      // Run handle with the arguments below.
      // Run handle with the arguments below.
      handle(async () => {
        // Wait for this asynchronous operation before continuing.
        // Wait for this asynchronous operation before continuing.
        await api(`/chats/${chatId}/sources/${source.id}`, {
          // Set the method option for this operation.
          // Set the method option for this operation.
          method: "DELETE",
          // Close the current expression or block.
        // Close the current expression or block.
        });
        // Supply this expression to the enclosing operation.
        // Run renderSources with the arguments below.
        sources = sources.filter((item) => item.id !== source.id);
        // Run renderSources with the arguments below.
        // Run renderSources with the arguments below.
        renderSources();
        // Run snapshots.delete with the arguments below.
        // Run snapshots.delete with the arguments below.
        snapshots.delete(chatId);
        // Close the current expression or block.
      // Close the current expression or block.
      }),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Run row.append with the arguments below.
    // Run row.append with the arguments below.
    row.append(label, remove);
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("source-list").append(row);
  }); // Allow removing evidence without affecting other chats.
} // Finish source rendering.
// Open the import dialog from any workspace tab.
// Run $ with the arguments below.
function openSources() {
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("source-dialog").showModal();
} // Open the import dialog from any workspace tab.
// Supply this expression to the enclosing operation.
// Run $ with the arguments below.
["add-source", "add-source-inline", "video-import"].forEach((id) =>
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $(id).addEventListener("click", openSources),
); // Connect import entry points.
// Supply this expression to the enclosing operation.
// Run $ with the arguments below.
["attach", "drop-zone", "dialog-upload"].forEach((id) =>
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $(id).addEventListener("click", () => $("file-input").click()),
); // Reuse one accessible file picker.
// Run $ with the arguments below.
// Run $ with the arguments below.
// Off-canvas navigation and sources share a single dismissible backdrop.
const compactNavigation = window.matchMedia('(max-width: 900px)');
const dockedSources = window.matchMedia('(min-width: 1201px)');
const appShell = document.querySelector('.app-shell');
const sidebar = $('sidebar');
const contextPanel = $('context-panel');
const backdrop = $('drawer-backdrop');

function closeDrawers({ restoreFocus = false } = {}) {
  const wasNav = sidebar.classList.contains('drawer-open');
  const wasSources = contextPanel.classList.contains('mobile-open');
  sidebar.classList.remove('drawer-open');
  contextPanel.classList.remove('mobile-open');
  backdrop.hidden = true;
  $('mobile-menu').setAttribute('aria-expanded', 'false');
  $('sources-toggle').setAttribute('aria-expanded', String(dockedSources.matches && !appShell.classList.contains('sources-collapsed')));
  if (restoreFocus && wasNav) $('mobile-menu').focus();
  else if (restoreFocus && wasSources) $('sources-toggle').focus();
}

function openSidebar() {
  if (!compactNavigation.matches) return;
  const isOpen = sidebar.classList.contains('drawer-open');
  closeDrawers();
  if (isOpen) return;
  sidebar.classList.add('drawer-open');
  backdrop.hidden = false;
  $('mobile-menu').setAttribute('aria-expanded', 'true');
  $('sidebar-close').focus();
}

function toggleSources() {
  if (dockedSources.matches) {
    const collapsed = appShell.classList.toggle('sources-collapsed');
    $('sources-toggle').setAttribute('aria-expanded', String(!collapsed));
    return;
  }
  const isOpen = contextPanel.classList.contains('mobile-open');
  closeDrawers();
  if (isOpen) return;
  contextPanel.classList.add('mobile-open');
  backdrop.hidden = false;
  $('sources-toggle').setAttribute('aria-expanded', 'true');
  $('sources-close').focus();
}

$('mobile-menu').addEventListener('click', openSidebar);
$('sidebar-close').addEventListener('click', () => closeDrawers({ restoreFocus: true }));
$('sources-toggle').addEventListener('click', toggleSources);
$('sources-close').addEventListener('click', () => closeDrawers({ restoreFocus: true }));
backdrop.addEventListener('click', () => closeDrawers({ restoreFocus: true }));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.querySelector('dialog[open]') &&
      (sidebar.classList.contains('drawer-open') || contextPanel.classList.contains('mobile-open'))) {
    closeDrawers({ restoreFocus: true });
  }
});
sidebar.addEventListener('click', (event) => {
  if (event.target.closest('.nav-item, .chat-list button, #new-chat, #account-open, #settings-open')) closeDrawers();
});
window.addEventListener('resize', () => {
  if (!compactNavigation.matches || dockedSources.matches) closeDrawers();
});
$('sources-toggle').setAttribute('aria-expanded', String(dockedSources.matches));

// Import document bytes directly through the independent Node backend.
// The backend parses the document and only its extracted text is saved in Supabase.
async function uploadFile(file) {
  if (!file) return;
  if (file.size < 1 || file.size > 12 * 1024 * 1024)
    throw new Error("Choose a file between 1 byte and 12 MB.");
  await ensureChat();
  const targetChat = chatId;
  toast("Uploading and extracting document…");
  const source = await api(`/chats/${targetChat}/file`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", "X-File-Name": encodeURIComponent(file.name) },
    body: file,
  });
  if (chatId === targetChat) {
    sources.push(source);
    renderSources();
  }
  $("source-dialog").close();
  toast("Source added to its conversation.");
}
$("file-input").addEventListener(
  // Allow retrying the same file after an error.
  // Run handle with the arguments below.
  "change",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Supply this expression to the enclosing operation.
    // Wait for this asynchronous operation before continuing.
    try {
      // Wait for this asynchronous operation before continuing.
      // Wait for this asynchronous operation before continuing.
      await uploadFile(event.target.files[0]);
      // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    } finally {
      // Supply this expression to the enclosing operation.
      // Close the current expression or block.
      event.target.value = "";
      // Close the current expression or block.
    // Close the current expression or block.
    }
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Allow retrying the same file after an error.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("drop-zone").addEventListener("dragover", (event) => {
  // Run event.preventDefault with the arguments below.
  // Run event.preventDefault with the arguments below.
  event.preventDefault();
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("drop-zone").classList.add("dragover");
}); // Highlight the drop target while dragging.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("drop-zone").addEventListener("dragleave", () =>
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("drop-zone").classList.remove("dragover"),
); // Remove drag highlighting when leaving the target.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("drop-zone").addEventListener(
  // Import the first deliberately dropped file.
  // Run handle with the arguments below.
  "drop",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("drop-zone").classList.remove("dragover");
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await uploadFile(event.dataTransfer.files[0]);
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Import the first deliberately dropped file.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("link-form").addEventListener(
  // Import public webpages and Google exports.
  // Run handle with the arguments below.
  "submit",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await ensureChat();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Reading the public source…");
    // Initialize source for the current operation.
    // Initialize source for the current operation.
    const source = await api(`/chats/${chatId}/link`, {
      // Set the method option for this operation.
      // Set the method option for this operation.
      method: "POST",
      // Set the body option for this operation.
      // Set the body option for this operation.
      body: JSON.stringify({ url: $("source-url").value }),
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Run sources.push with the arguments below.
    // Run sources.push with the arguments below.
    sources.push(source);
    // Run renderSources with the arguments below.
    // Run renderSources with the arguments below.
    renderSources();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("source-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Link imported into this conversation.");
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Import public webpages and Google exports.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("text-form").addEventListener(
  // Accept pasted source notes or video transcripts.
  // Run handle with the arguments below.
  "submit",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await ensureChat();
    // Initialize source for the current operation.
    // Initialize source for the current operation.
    const source = await api(`/chats/${chatId}/text`, {
      // Set the method option for this operation.
      // Set the method option for this operation.
      method: "POST",
      // Set the body option for this operation.
      // Set the body option for this operation.
      body: JSON.stringify({
        // Set the name option for this operation.
        // Set the name option for this operation.
        name: $("text-name").value,
        // Set the text option for this operation.
        // Set the text option for this operation.
        text: $("source-text").value,
        // Close the current expression or block.
      // Close the current expression or block.
      }),
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Run sources.push with the arguments below.
    // Run sources.push with the arguments below.
    sources.push(source);
    // Run renderSources with the arguments below.
    // Run renderSources with the arguments below.
    renderSources();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("source-text").value = "";
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("source-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Text source added to this conversation.");
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Accept pasted source notes or video transcripts.
// Render user text safely without interpreting markup.
// Initialize node for the current operation.
function renderUser(text) {
  // Initialize node for the current operation.
  // Initialize node for the current operation.
  const node = element("article", "message user", text);
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("messages").append(node);
} // Render user text safely without interpreting markup.
// Preview generated learning content before export.
// Preview generated learning content before export.
function showArtifact(artifact, kind) {
  // Preview generated learning content before export.
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  currentArtifact = artifact;
  // Supply this expression to the enclosing operation.
  // Run $ with the arguments below.
  artifactKind = kind;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("artifact-title").textContent = artifact.title;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("artifact-content").replaceChildren();
  $("complete-goal").hidden = Boolean(artifact.cards?.length); // Set the current export and practice state.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (artifact.cards?.length)
    renderCards(artifact.cards); // Open interactive recall practice for card sets.
  // Handle the alternative case.
  // Handle the alternative case.
  else
    // Run artifact.sections.forEach with the arguments below.
    // Run artifact.sections.forEach with the arguments below.
    artifact.sections.forEach((section) => {
      // Initialize node for the current operation.
      // Initialize node for the current operation.
      const node = element("section", "artifact-section");
      // Run node.append with the arguments below.
      // Run node.append with the arguments below.
      node.append(element("h3", "", section.heading));
      // Initialize body for the current operation.
      // Initialize body for the current operation.
      const body = element("div");
      // Supply this expression to the enclosing operation.
      // Run node.append with the arguments below.
      body.innerHTML = markdown(section.body);
      // Run node.append with the arguments below.
      // Run node.append with the arguments below.
      node.append(body);
      // Run $ with the arguments below.
      // Run $ with the arguments below.
      $("artifact-content").append(node);
    }); // Render safe structured chapters or slide notes.
  if (window.studybuddyOpenArtifact?.(artifact, kind)) return;
  if (!$("artifact-dialog").open) $("artifact-dialog").showModal(); // Avoid reopening an already active modal.
} // Finish artifact previews.
// Render an answer with inspectable evidence and specific feedback controls.
// Render an answer with inspectable evidence and specific feedback controls.
function renderAnswer(result, id, sample = false) {
  // Render an answer with inspectable evidence and specific feedback controls.
  // Initialize node for the current operation.
  // Initialize node for the current operation.
  const node = element("article", "message assistant");
  node.append(element("div", "message-label", "✦ STUDYBUDDY")); // Label the assistant contribution.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (sample)
    // Run node.append with the arguments below.
    // Run node.append with the arguments below.
    node.append(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("span", "sample-tag", "ILLUSTRATIVE EXAMPLE · NO AI REQUEST"),
    ); // Distinguish a static example from a generated answer.
  // Initialize content for the current operation.
  // Initialize content for the current operation.
  const content = element("div");
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  content.innerHTML = markdown(
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    result.artifact
      ? // Supply this expression to the enclosing operation.
        // Supply this expression to the enclosing operation.
        `**${result.artifact.title}**\n\nYour learning material is ready to review.`
      : // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        result.content,
    // Close the current expression or block.
  // Close the current expression or block.
  );
  node.append(content); // Render the answer through the sanitization boundary.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (result.artifact) {
    // Initialize open for the current operation.
    // Initialize open for the current operation.
    const open = element("button", "secondary", "Open study material ↗");
    // Run open.addEventListener with the arguments below.
    // Run open.addEventListener with the arguments below.
    open.addEventListener(
      // Run showArtifact with the arguments below.
      "click",
      // Run showArtifact with the arguments below.
      () =>
        // Run showArtifact with the arguments below.
        // Run showArtifact with the arguments below.
        showArtifact(result.artifact, result.kind || ""),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Run node.append with the arguments below.
    // Run node.append with the arguments below.
    node.append(open);
  } // Reopen generated material from conversation history.
  // Initialize evidence for the current operation.
  // Initialize evidence for the current operation.
  const evidence = element("div");
  // Supply this expression to the enclosing operation.
  // Initialize details for the current operation.
  (result.citations || []).forEach((citation) => {
    // Initialize details for the current operation.
    // Initialize details for the current operation.
    const details = element("details", "citation");
    // Run details.append with the arguments below.
    // Run details.append with the arguments below.
    details.append(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element(
        // Supply this literal value to the enclosing operation.
        // Supply this literal value to the enclosing operation.
        "summary",
        // Supply this literal value to the enclosing operation.
        // Supply this expression to the enclosing operation.
        "",
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        `[${citation.label}] ${citation.name} · passage ${citation.passage}`,
        // Close the current expression or block.
      // Close the current expression or block.
      ),
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("p", "", citation.text),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (citation.url) {
      // Initialize link for the current operation.
      // Initialize link for the current operation.
      const link = element("a", "", "Open original ↗");
      // Supply this expression to the enclosing operation.
      // Supply this expression to the enclosing operation.
      link.href = citation.url;
      // Supply this expression to the enclosing operation.
      // Supply this expression to the enclosing operation.
      link.target = "_blank";
      // Supply this expression to the enclosing operation.
      // Run details.append with the arguments below.
      link.rel = "noopener noreferrer";
      // Run details.append with the arguments below.
      // Run details.append with the arguments below.
      details.append(link);
      // Close the current expression or block.
    // Close the current expression or block.
    }
    // Run evidence.append with the arguments below.
    // Run evidence.append with the arguments below.
    evidence.append(details);
    // Close the current expression or block.
  // Close the current expression or block.
  });
  node.append(evidence); // Let users inspect quoted passages behind citations.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (!sample) {
    // Initialize bar for the current operation.
    // Initialize bar for the current operation.
    const bar = element("div", "message-tools");
    // Supply this expression to the enclosing operation.
    // Initialize button for the current operation.
    ["Helpful", "Needs work"].forEach((label) => {
      // Initialize button for the current operation.
      // Initialize button for the current operation.
      const button = element(
        // Supply this literal value to the enclosing operation.
        // Supply this literal value to the enclosing operation.
        "button",
        // Supply this literal value to the enclosing operation.
        // Supply this expression to the enclosing operation.
        "",
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        label === "Helpful" ? "♡ Helpful" : "Improve this answer",
        // Close the current expression or block.
      // Close the current expression or block.
      );
      // Run button.addEventListener with the arguments below.
      // Run button.addEventListener with the arguments below.
      button.addEventListener(
        // Supply this literal value to the enclosing operation.
        // Run handle with the arguments below.
        "click",
        // Run handle with the arguments below.
        // Run handle with the arguments below.
        handle(async () => {
          // Initialize note for the current operation.
          // Initialize note for the current operation.
          const note =
            // Supply this expression to the enclosing operation.
            // Supply this expression to the enclosing operation.
            label === "Helpful"
              ? // Supply this expression to the enclosing operation.
                // Supply this expression to the enclosing operation.
                ""
              : // Supply this expression to the enclosing operation.
                // Run window.prompt with the arguments below.
                window.prompt(
                  // Supply this literal value to the enclosing operation.
                  // Supply this literal value to the enclosing operation.
                  "What should improve? For example: shorter steps, clearer examples, or a source mismatch.",
                  // Supply this literal value to the enclosing operation.
                  // Close the current expression or block.
                  "",
                  // Close the current expression or block.
                // Close the current expression or block.
                );
          // Apply the following behavior only when its condition matches.
          // Apply the following behavior only when its condition matches.
          if (note === null) return;
          // Wait for this asynchronous operation before continuing.
          // Wait for this asynchronous operation before continuing.
          await api("/feedback", {
            // Set the method option for this operation.
            // Set the method option for this operation.
            method: "POST",
            // Set the body option for this operation.
            // Set the body option for this operation.
            body: JSON.stringify({
              // Set the message option for this operation.
              // Set the message option for this operation.
              message: id,
              // Set the rating option for this operation.
              // Set the rating option for this operation.
              rating: label === "Helpful" ? "helpful" : "needs-work",
              // Set the note option for this operation.
              // Set the note option for this operation.
              note: note.slice(0, 600),
              // Close the current expression or block.
            // Close the current expression or block.
            }),
            // Close the current expression or block.
          // Close the current expression or block.
          });
          // Run toast with the arguments below.
          // Run toast with the arguments below.
          toast(
            // Supply this expression to the enclosing operation.
            // Supply this expression to the enclosing operation.
            profile.personalization
              ? // Supply this expression to the enclosing operation.
                // Supply this expression to the enclosing operation.
                "Feedback saved for future personalized responses."
              : // Supply this expression to the enclosing operation.
                // Close the current expression or block.
                "Feedback saved. Enable personalization to use it in future responses.",
            // Close the current expression or block.
          // Close the current expression or block.
          );
          // Close the current expression or block.
        // Close the current expression or block.
        }),
        // Close the current expression or block.
      // Close the current expression or block.
      );
      // Run bar.append with the arguments below.
      // Run bar.append with the arguments below.
      bar.append(button);
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Run node.append with the arguments below.
    // Run node.append with the arguments below.
    node.append(bar);
  } // Save meaningful feedback rather than generic ratings alone.
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("messages").append(node);
  $("chat-area").scrollTop = $("chat-area").scrollHeight; // Keep the latest completed response in view.
} // Finish answer rendering.
// Run grounded chat or a structured study task.
// Run grounded chat or a structured study task.
async function generate(kind, question) {
  // Run grounded chat or a structured study task.
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (busy) return;
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (!question.trim()) throw new Error("Write a question or task first.");
  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await ensureChat();
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  // Supply this expression to the enclosing operation.
  // Run $ with the arguments below.
  busy = true;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("send").disabled = true;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("welcome").hidden = true;
  // Run changeTab with the arguments below.
  // Run changeTab with the arguments below.
  changeTab("chat");
  // Initialize waiting for the current operation.
  // Initialize waiting for the current operation.
  const waiting = element(
    // Show a truthful pending state without a fabricated answer.
    // Show a truthful pending state without a fabricated answer.
    "article",
    // Show a truthful pending state without a fabricated answer.
    // Show a truthful pending state without a fabricated answer.
    "message assistant",
    // Show a truthful pending state without a fabricated answer.
    // Close the current expression or block.
    "✦ Reading your sources and connecting the ideas…",
    // Close the current expression or block.
  // Close the current expression or block.
  );
  $("messages").append(waiting); // Show a truthful pending state without a fabricated answer.
  // Refresh the visible opt-in topic memory after generation.
  // Initialize result for the current operation.
  try {
    // Initialize result for the current operation.
    // Initialize result for the current operation.
    const result = await api(`/chats/${chatId}/ask`, {
      // Set the method option for this operation.
      // Set the method option for this operation.
      method: "POST",
      // Set the body option for this operation.
      // Set the body option for this operation.
      body: JSON.stringify({ question, style: $("style").value, kind }),
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Refresh the visible opt-in topic memory after generation.
    // Refresh the visible opt-in topic memory after generation.
    result.kind = kind;
    profile = await api("/profile"); // Refresh the visible opt-in topic memory after generation.
    // Run waiting.remove with the arguments below.
    // Run waiting.remove with the arguments below.
    waiting.remove();
    // Run renderUser with the arguments below.
    // Run renderUser with the arguments below.
    renderUser(question);
    // Run renderAnswer with the arguments below.
    // Run renderAnswer with the arguments below.
    renderAnswer(result, result.id);
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (kind === "chat") {
      // Run $ with the arguments below.
      // Run $ with the arguments below.
      $("question").value = "";
      // Run drafts.delete with the arguments below.
      // Run drafts.delete with the arguments below.
      drafts.delete(chatId);
      // Close the current expression or block.
    // Close the current expression or block.
    }
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (result.artifact) {
      showArtifact(result.artifact, kind);
      if (result.libraryWarning) toast(result.libraryWarning);
      else if (result.libraryItem) toast('✿ Your creation was saved to My Library.');
    }
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await refreshChats();
    // Initialize data for the current operation.
    // Initialize data for the current operation.
    const data = await api(`/chats/${chatId}`);
    // Run snapshots.set with the arguments below.
    // Run snapshots.set with the arguments below.
    snapshots.set(chatId, data);
    // Persist successful results and cache them for offline viewing.
  // Persist successful results and cache them for offline viewing.
  } finally {
    // Persist successful results and cache them for offline viewing.
    // Run waiting.remove with the arguments below.
    // Run waiting.remove with the arguments below.
    waiting.remove();
    // Supply this expression to the enclosing operation.
    // Run $ with the arguments below.
    busy = false;
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("send").disabled = false;
  } // Preserve the draft after failure and always unlock the composer.
} // Finish task generation.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("chat-form").addEventListener(
  // Connect the submit button to grounded generation.
  // Run handle with the arguments below.
  "submit",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await generate("chat", $("question").value);
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Connect the submit button to grounded generation.
// Initialize prompts for the current operation.
// Initialize prompts for the current operation.
const prompts = {
  // Set the summary option for this operation.
  // Set the summary option for this operation.
  summary:
    // Provide specific editable generation instructions.
    // Set the review option for this operation.
    "Summarize my sources with key ideas, important facts, definitions, and source citations.",
  // Set the review option for this operation.
  // Set the review option for this operation.
  review:
    // Provide specific editable generation instructions.
    // Set the flashcards option for this operation.
    "Review my source material. Identify specific strengths, evidence-supported mistakes or gaps, and actionable next steps. State what cannot be assessed.",
  // Set the flashcards option for this operation.
  // Set the flashcards option for this operation.
  flashcards:
    // Provide specific editable generation instructions.
    // Set the textbook option for this operation.
    "Create 10 useful active-recall flashcards from my sources, each with a clear question and cited answer.",
  // Set the textbook option for this operation.
  // Set the textbook option for this operation.
  textbook:
    // Provide specific editable generation instructions.
    // Set the slides option for this operation.
    "Create a concise textbook from my sources with learning objectives, chapters, worked examples, misconceptions, key terms, and review questions.",
  // Set the slides option for this operation.
  // Set the slides option for this operation.
  slides:
    // Provide specific editable generation instructions.
    // Set the planner option for this operation.
    "Create a readable 8-slide presentation from my sources with a clear narrative and concise bullet points.",
  // Set the planner option for this operation.
  // Set the planner option for this operation.
  planner:
    // Provide specific editable generation instructions.
    // Provide specific editable generation instructions.
    "Create a 7-day study plan for these sources, assuming 30 minutes daily. Include active recall, spaced review, practical tasks, and checkpoints.",
}; // Provide specific editable generation instructions.
// Run document.querySelectorAll with the arguments below.
// Run document.querySelectorAll with the arguments below.
document.querySelectorAll("[data-tool]").forEach((button) =>
  // Run button.addEventListener with the arguments below.
  // Run button.addEventListener with the arguments below.
  button.addEventListener(
    // Let users customize artifact scope before spending an AI request.
    // Run handle with the arguments below.
    "click",
    // Run handle with the arguments below.
    // Run handle with the arguments below.
    handle(async () => {
      // Initialize kind for the current operation.
      // Initialize kind for the current operation.
      const kind = button.dataset.tool;
      // Initialize question for the current operation.
      // Initialize question for the current operation.
      const question = window.prompt(
        // Supply this literal value to the enclosing operation.
        // Supply this expression to the enclosing operation.
        "Adjust your task before generating:",
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        prompts[kind],
        // Close the current expression or block.
      // Close the current expression or block.
      );
      // Apply the following behavior only when its condition matches.
      // Apply the following behavior only when its condition matches.
      if (question) await generate(kind, question);
      // Close the current expression or block.
    // Close the current expression or block.
    }),
    // Close the current expression or block.
  // Close the current expression or block.
  ),
); // Let users customize artifact scope before spending an AI request.
// Record optional self-reported milestones only once.
// Apply the following behavior only when its condition matches.
async function award(goal) {
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (!profile.achievements) {
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast(
      // Supply this literal value to the enclosing operation.
      // Close the current expression or block.
      "Activity complete. Enable achievements in settings if you’d like XP.",
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Return the result to the calling operation.
    // Return the result to the calling operation.
    return;
    // Close the current expression or block.
  // Close the current expression or block.
  }
  // Initialize result for the current operation.
  // Initialize result for the current operation.
  const result = await api("/achievements", {
    // Set the method option for this operation.
    // Set the method option for this operation.
    method: "POST",
    // Set the body option for this operation.
    // Set the body option for this operation.
    body: JSON.stringify({ goal }),
    // Close the current expression or block.
  // Close the current expression or block.
  });
  // Supply this expression to the enclosing operation.
  // Run renderProgress with the arguments below.
  profile.goals = result.goals;
  // Run renderProgress with the arguments below.
  // Run renderProgress with the arguments below.
  renderProgress();
  // Run toast with the arguments below.
  // Run toast with the arguments below.
  toast("Milestone saved. Nice work putting your learning into practice.");
} // Record optional self-reported milestones only once.
// Display real recorded progress without simulated scores.
// Initialize goals for the current operation.
function renderProgress() {
  // Initialize goals for the current operation.
  // Initialize goals for the current operation.
  const goals = profile.goals || [];
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("xp-label").textContent = profile.achievements
    ? // Supply this expression to the enclosing operation.
      // Supply this expression to the enclosing operation.
      `${goals.length * 50} XP · ${goals.length} of 3 milestones`
    : // Supply this expression to the enclosing operation.
      // Run $ with the arguments below.
      "Progress, at your pace.";
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("xp-note").textContent = profile.achievements
    ? // Supply this expression to the enclosing operation.
      // Supply this expression to the enclosing operation.
      goals.length
      ? // Supply this expression to the enclosing operation.
        // Continue the current transformation.
        goals
          // Continue the current transformation.
          // Supply this expression to the enclosing operation.
          .map(
            // Supply this expression to the enclosing operation.
            // Supply this expression to the enclosing operation.
            (goal) =>
              // Supply this expression to the enclosing operation.
              // Set the first-review option for this operation.
              ({
                // Set the first-review option for this operation.
                // Set the first-review option for this operation.
                "first-review": "Thoughtful reviewer",
                // Set the five-cards option for this operation.
                // Set the five-cards option for this operation.
                "five-cards": "Recall explorer",
                // Set the study-plan option for this operation.
                // Set the study-plan option for this operation.
                "study-plan": "Learning planner",
                // Supply this expression to the enclosing operation.
              // Close the current expression or block.
              })[goal],
            // Close the current expression or block.
          // Close the current expression or block.
          )
          // Continue the current transformation.
          // Supply this expression to the enclosing operation.
          .join(" · ")
      : // Supply this expression to the enclosing operation.
        // Display real recorded progress without simulated scores.
        "Review your work, practise 5 cards, or complete a study plan."
    : // Display real recorded progress without simulated scores.
      // Display real recorded progress without simulated scores.
      "Achievements are optional. Enable them in Settings & memory.";
} // Display real recorded progress without simulated scores.
// Practice cards with explicit reveal actions and a five-card milestone.
// Initialize index for the current operation.
function renderCards(cards) {
  // Initialize index for the current operation.
  // Initialize index for the current operation.
  let index = 0;
  // Initialize flipped for the current operation.
  // Initialize flipped for the current operation.
  let flipped = false;
  // Initialize reviewed for the current operation.
  // Initialize reviewed for the current operation.
  const reviewed = new Set();
  // Initialize box for the current operation.
  // Initialize box for the current operation.
  const box = element("div", "flashcard");
  // Initialize controls for the current operation.
  // Initialize controls for the current operation.
  const controls = element("div", "flashcard-controls");
  // Initialize previous for the current operation.
  // Initialize previous for the current operation.
  const previous = element("button", "secondary", "← Previous");
  // Initialize flip for the current operation.
  // Initialize flip for the current operation.
  const flip = element("button", "primary", "Show answer");
  // Initialize next for the current operation.
  // Initialize next for the current operation.
  const next = element("button", "secondary", "Next →");
  // Initialize draw for the current operation.
  // Initialize draw for the current operation.
  const draw = () => {
    // Run box.replaceChildren with the arguments below.
    // Run box.replaceChildren with the arguments below.
    box.replaceChildren(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element(
        // Supply this literal value to the enclosing operation.
        // Supply this literal value to the enclosing operation.
        "small",
        // Supply this literal value to the enclosing operation.
        // Supply this expression to the enclosing operation.
        "",
        // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        `CARD ${index + 1} OF ${cards.length} · ${reviewed.size} REVIEWED`,
        // Close the current expression or block.
      // Close the current expression or block.
      ),
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("p", "", flipped ? cards[index].back : cards[index].front),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    flip.textContent = flipped ? "Show question" : "Show answer";
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    previous.disabled = index === 0;
    // Supply this expression to the enclosing operation.
    // Close the current expression or block.
    next.disabled = index === cards.length - 1;
    // Close the current expression or block.
  // Close the current expression or block.
  };
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  previous.onclick = () => {
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    index = Math.max(0, index - 1);
    // Supply this expression to the enclosing operation.
    // Run draw with the arguments below.
    flipped = false;
    // Run draw with the arguments below.
    // Run draw with the arguments below.
    draw();
    // Close the current expression or block.
  // Close the current expression or block.
  };
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  next.onclick = () => {
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    index = Math.min(cards.length - 1, index + 1);
    // Supply this expression to the enclosing operation.
    // Run draw with the arguments below.
    flipped = false;
    // Run draw with the arguments below.
    // Run draw with the arguments below.
    draw();
    // Close the current expression or block.
  // Close the current expression or block.
  };
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  flip.onclick = handle(async () => {
    // Supply this expression to the enclosing operation.
    // Apply the following behavior only when its condition matches.
    flipped = !flipped;
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (flipped) {
      // Initialize before for the current operation.
      // Initialize before for the current operation.
      const before = reviewed.size;
      // Run reviewed.add with the arguments below.
      // Run reviewed.add with the arguments below.
      reviewed.add(index);
      // Apply the following behavior only when its condition matches.
      // Apply the following behavior only when its condition matches.
      if (before === 4 && reviewed.size === 5) await award("five-cards");
      // Close the current expression or block.
    // Close the current expression or block.
    }
    // Run draw with the arguments below.
    // Run draw with the arguments below.
    draw();
    // Close the current expression or block.
  // Close the current expression or block.
  });
  // Run controls.append with the arguments below.
  // Run controls.append with the arguments below.
  controls.append(previous, flip, next);
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("artifact-content").append(box, controls);
  // Run draw with the arguments below.
  // Run draw with the arguments below.
  draw();
} // Practice cards with explicit reveal actions and a five-card milestone.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("complete-goal").addEventListener(
  // Let users mark a reviewed artifact as complete.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(
    // Run award with the arguments below.
    () =>
      // Run award with the arguments below.
      // Run award with the arguments below.
      award(artifactKind === "planner" ? "study-plan" : "first-review"),
    // Close the current expression or block.
  // Close the current expression or block.
  ),
); // Let users mark a reviewed artifact as complete.
// Run document.querySelectorAll with the arguments below.
// Run document.querySelectorAll with the arguments below.
document.querySelectorAll("[data-export]").forEach((button) =>
  // Run button.addEventListener with the arguments below.
  // Run button.addEventListener with the arguments below.
  button.addEventListener(
    // Download the server-generated office file with a safe filename.
    // Run handle with the arguments below.
    "click",
    // Run handle with the arguments below.
    // Run handle with the arguments below.
    handle(async () => {
      // Apply the following behavior only when its condition matches.
      // Apply the following behavior only when its condition matches.
      if (!currentArtifact) return;
      // Initialize format for the current operation.
      // Initialize format for the current operation.
      const format = button.dataset.export;
      // Initialize blob for the current operation.
      // Initialize blob for the current operation.
      const blob = await api("/export", {
        // Set the method option for this operation.
        // Set the method option for this operation.
        method: "POST",
        // Set the body option for this operation.
        // Set the body option for this operation.
        body: JSON.stringify({ format, artifact: currentArtifact }),
        // Set the binary option for this operation.
        // Set the binary option for this operation.
        binary: true,
        // Close the current expression or block.
      // Close the current expression or block.
      });
      // Initialize url for the current operation.
      // Initialize url for the current operation.
      const url = URL.createObjectURL(blob);
      // Initialize anchor for the current operation.
      // Initialize anchor for the current operation.
      const anchor = element("a");
      // Supply this expression to the enclosing operation.
      // Supply this expression to the enclosing operation.
      anchor.href = url;
      // Supply this expression to the enclosing operation.
      // Run anchor.click with the arguments below.
      anchor.download = `${currentArtifact.title.replace(/[^a-zA-Z0-9 -]/g, "").slice(0, 70) || "StudyBuddy"}.${format}`;
      // Run anchor.click with the arguments below.
      // Run anchor.click with the arguments below.
      anchor.click();
      // Run setTimeout with the arguments below.
      // Run setTimeout with the arguments below.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      // Run toast with the arguments below.
      // Run toast with the arguments below.
      toast("Your document is ready.");
      // Close the current expression or block.
    // Close the current expression or block.
    }),
    // Close the current expression or block.
  // Close the current expression or block.
  ),
); // Download the server-generated office file with a safe filename.
// Initialize resources for the current operation.
// Initialize resources for the current operation.
const resources = [
  {"name": "POLITEMall", "subject": "ITE & Polytechnic", "description": "Online learning from Singapore ITE and five polytechnics. Some content requires campus login.", "url": "https://politemall.polite.edu.sg/", "publisher": "ITE + five polytechnics"},
  {"name": "MOE Student Learning Space", "subject": "MOE", "description": "MOE Library and self-study resources for eligible students; account access may be required.", "url": "https://www.learning.moe.edu.sg/students/student-user-guide/discover/", "publisher": "Ministry of Education Singapore"},
  {"name": "ITE Applied Learning", "subject": "ITE", "description": "ITE applied learning modules, including IT, engineering and cybersecurity.", "url": "https://www.ite.edu.sg/secondary-school-students/applied-learning-modules/modules/", "publisher": "Institute of Technical Education"},
  {"name": "ITE Career Resources", "subject": "ITE & career", "description": "Career guidance, job skills and employment resources for ITE students and graduates.", "url": "https://www.ite.edu.sg/alumni/career-guidance-and-services/career-guidance/", "publisher": "Institute of Technical Education"},
  {"name": "POLITE Technology Resources", "subject": "Polytechnic & ITE", "description": "Discover technology facilities and specialist expertise from polytechnics and ITE.", "url": "https://techresources.polite.edu.sg/", "publisher": "ITE and five polytechnics"},
  {"name": "SkillsFuture Singapore", "subject": "Work skills", "description": "Training pathways, continuing education, career planning and workforce skills.", "url": "https://www.myskillsfuture.gov.sg/", "publisher": "SkillsFuture Singapore"},
  {"name": "SkillsFuture Official Answers", "subject": "Work skills", "description": "Official programme and course application questions and answers.", "url": "https://ask.gov.sg/skillsfuture", "publisher": "Singapore Government"},
  {"name": "Applied Learning Module Portal", "subject": "ITE & Polytechnic", "description": "Browse applied learning modules from ITE and Singapore polytechnics.", "url": "https://www.myskillsfuture.gov.sg/content/student/en/aplm.html", "publisher": "SkillsFuture Singapore"},

  // Supply this expression to the enclosing operation.
  // Set the name option for this operation.
  {
    // Set the name option for this operation.
    // Set the name option for this operation.
    name: "OpenStax",
    // Set the subject option for this operation.
    // Set the subject option for this operation.
    subject: "Science & mathematics",
    // Set the description option for this operation.
    // Set the description option for this operation.
    description:
      // Supply this literal value to the enclosing operation.
      // Set the url option for this operation.
      "Open textbooks with chapter-level explanations and practice questions.",
    // Set the url option for this operation.
    // Set the url option for this operation.
    url: "https://openstax.org/subjects",
    // Set the publisher option for this operation.
    // Set the publisher option for this operation.
    publisher: "Rice University initiative",
    // Close the current expression or block.
  // Close the current expression or block.
  },
  // Supply this expression to the enclosing operation.
  // Set the name option for this operation.
  {
    // Set the name option for this operation.
    // Set the name option for this operation.
    name: "MIT OpenCourseWare",
    // Set the subject option for this operation.
    // Set the subject option for this operation.
    subject: "Computing & engineering",
    // Set the description option for this operation.
    // Set the description option for this operation.
    description:
      // Supply this literal value to the enclosing operation.
      // Set the url option for this operation.
      "Open course materials, lecture notes, and assignments from MIT.",
    // Set the url option for this operation.
    // Set the url option for this operation.
    url: "https://ocw.mit.edu/",
    // Set the publisher option for this operation.
    // Set the publisher option for this operation.
    publisher: "Massachusetts Institute of Technology",
    // Close the current expression or block.
  // Close the current expression or block.
  },
  // Supply this expression to the enclosing operation.
  // Set the name option for this operation.
  {
    // Set the name option for this operation.
    // Set the name option for this operation.
    name: "NIST Cybersecurity Framework",
    // Set the subject option for this operation.
    // Set the subject option for this operation.
    subject: "Cybersecurity",
    // Set the description option for this operation.
    // Set the description option for this operation.
    description:
      // Supply this literal value to the enclosing operation.
      // Set the url option for this operation.
      "Primary guidance for understanding and communicating cybersecurity risk.",
    // Set the url option for this operation.
    // Set the url option for this operation.
    url: "https://www.nist.gov/cyberframework",
    // Set the publisher option for this operation.
    // Set the publisher option for this operation.
    publisher: "US National Institute of Standards and Technology",
    // Close the current expression or block.
  // Close the current expression or block.
  },
  // Supply this expression to the enclosing operation.
  // Set the name option for this operation.
  {
    // Set the name option for this operation.
    // Set the name option for this operation.
    name: "MDN Web Docs",
    // Set the subject option for this operation.
    // Set the subject option for this operation.
    subject: "Web development",
    // Set the description option for this operation.
    // Set the description option for this operation.
    description:
      // Supply this literal value to the enclosing operation.
      // Set the url option for this operation.
      "Technical references and practical explanations of the web platform.",
    // Set the url option for this operation.
    // Set the url option for this operation.
    url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
    // Set the publisher option for this operation.
    // Set the publisher option for this operation.
    publisher: "MDN / Mozilla community",
    // Close the current expression or block.
  // Close the current expression or block.
  },
  // Supply this expression to the enclosing operation.
  // Set the name option for this operation.
  {
    // Set the name option for this operation.
    // Set the name option for this operation.
    name: "OpenLearn",
    // Set the subject option for this operation.
    // Set the subject option for this operation.
    subject: "Learning & skills",
    // Set the description option for this operation.
    // Set the description option for this operation.
    description:
      // Supply this literal value to the enclosing operation.
      // Set the url option for this operation.
      "Free learning materials across education, technology, and everyday life.",
    // Set the url option for this operation.
    // Set the url option for this operation.
    url: "https://www.open.edu/openlearn/",
    // Set the publisher option for this operation.
    // Set the publisher option for this operation.
    publisher: "The Open University",
    // Close the current expression or block.
  // Close the current expression or block.
  },
  // Define a transparent starter directory rather than claiming universal certification.
  // Set the name option for this operation.
  {
    // Set the name option for this operation.
    // Set the name option for this operation.
    name: "NCBI Bookshelf",
    // Set the subject option for this operation.
    // Set the subject option for this operation.
    subject: "Biology & neuroscience",
    // Set the description option for this operation.
    // Set the description option for this operation.
    description:
      // Define a transparent starter directory rather than claiming universal certification.
      // Set the url option for this operation.
      "A searchable collection of biomedical and life sciences books.",
    // Set the url option for this operation.
    // Set the url option for this operation.
    url: "https://www.ncbi.nlm.nih.gov/books/",
    // Set the publisher option for this operation.
    // Set the publisher option for this operation.
    publisher: "US National Library of Medicine",
    // Close the current expression or block.
  // Close the current expression or block.
  },
]; // Define a transparent starter directory rather than claiming universal certification.
// Filter and render resource cards entirely on the client.
// Initialize grid for the current operation.
function renderResources(query = "") {
  // Initialize grid for the current operation.
  // Initialize grid for the current operation.
  const grid = $("resource-grid");
  // Run grid.replaceChildren with the arguments below.
  // Run grid.replaceChildren with the arguments below.
  grid.replaceChildren();
  // Initialize matches for the current operation.
  // Initialize matches for the current operation.
  const matches = resources.filter(
    // Run JSON.stringify with the arguments below.
    (item) =>
      // Run JSON.stringify with the arguments below.
      // Run JSON.stringify with the arguments below.
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase()),
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (!matches.length)
    // Run grid.append with the arguments below.
    // Run grid.append with the arguments below.
    grid.append(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("p", "muted", "No matching resources. Try a broader subject."),
      // Close the current expression or block.
    // Close the current expression or block.
    );
  // Run matches.forEach with the arguments below.
  // Run matches.forEach with the arguments below.
  matches.forEach((resource) => {
    // Initialize card for the current operation.
    // Initialize card for the current operation.
    const card = element("article", "resource-card");
    // Run card.append with the arguments below.
    // Run card.append with the arguments below.
    card.append(
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("small", "", resource.subject),
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("h3", "", resource.name),
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("p", "", resource.description),
      // Run element with the arguments below.
      // Run element with the arguments below.
      element("p", "small", resource.publisher),
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Initialize link for the current operation.
    // Initialize link for the current operation.
    const link = element("a", "", "Explore ↗");
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    link.href = resource.url;
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    link.target = "_blank";
    // Supply this expression to the enclosing operation.
    // Initialize add for the current operation.
    link.rel = "noopener noreferrer";
    // Initialize add for the current operation.
    // Initialize add for the current operation.
    const add = element("button", "", "Add a page →");
    // Supply this expression to the enclosing operation.
    // Run $ with the arguments below.
    add.onclick = () => {
      // Run $ with the arguments below.
      // Run $ with the arguments below.
      $("source-url").value = resource.url;
      // Run openSources with the arguments below.
      // Run openSources with the arguments below.
      openSources();
      // Close the current expression or block.
    // Close the current expression or block.
    };
    // Run card.append with the arguments below.
    // Run card.append with the arguments below.
    card.append(link, add);
    // Run grid.append with the arguments below.
    // Run grid.append with the arguments below.
    grid.append(card);
    // Close the current expression or block.
  // Close the current expression or block.
  });
} // Filter and render resource cards entirely on the client.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("resource-search").addEventListener(
  // Run renderResources with the arguments below.
  "input",
  // Run renderResources with the arguments below.
  (event) =>
    // Run renderResources with the arguments below.
    // Run renderResources with the arguments below.
    renderResources(event.target.value),
  // Close the current expression or block.
// Close the current expression or block.
);
renderResources(); // Enable immediate local resource filtering.
// Supply this expression to the enclosing operation.
// Run $ with the arguments below.
let authMode = "login";
function setAuthMode(mode) {
  authMode = mode === "signup" ? "signup" : "login";
  const signingUp = authMode === "signup";
  // Keyboard-accessible auth tabs: arrow keys move between Log in and Sign up.
document.querySelector('.auth-tabs')?.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = [...document.querySelectorAll('[data-auth-mode]')];
  const active = tabs.findIndex(tab => tab.dataset.authMode === authMode);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
    (active + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  setAuthMode(tabs[next].dataset.authMode);
  tabs[next].focus();
});
$('password-visibility')?.addEventListener('click', () => {
  const field = $('password');
  const visible = field.type === 'password';
  field.type = visible ? 'text' : 'password';
  $('password-visibility').textContent = visible ? 'Hide' : 'Show';
  $('password-visibility').setAttribute('aria-pressed', String(visible));
});
document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
    const active = tab.dataset.authMode === authMode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  $("auth-title").textContent = signingUp ? "Make space for learning" : "Welcome back!";
  $("auth-subtitle").textContent = signingUp ? "Create your account and keep every bright idea." : "Pick up right where you left off.";
  $("auth-submit").innerHTML = signingUp ? 'Create my account <span aria-hidden="true">→</span>' : 'Log in to StudyBuddy <span aria-hidden="true">→</span>';
  $("password").autocomplete = signingUp ? "new-password" : "current-password";
  $("password").minLength = signingUp ? 12 : 1;
  $("auth-password-hint").hidden = !signingUp;
  $('password').type = 'password';
  $('password-visibility').textContent = 'Show';
  $('password-visibility').setAttribute('aria-pressed','false');
  $("auth-feedback").hidden = true;
}
document.querySelectorAll("[data-auth-mode]").forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});
$("account-open").addEventListener("click", () => {
  setAuthMode("login");
  const signedIn = Boolean(token);
  $("account-form").hidden = signedIn;
  $("auth-signed-in").hidden = !signedIn;
  document.querySelector(".auth-tabs").hidden = signedIn;
  $("account-dialog").showModal();
});
$("account-form").addEventListener(
  // Validate and authenticate without exposing DeepSeek credentials to the browser.
  // Run handle with the arguments below.
  "submit",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    const loginButton = $('auth-submit');
    if (loginButton.disabled) return; // Ignore accidental rapid double-submissions.
    loginButton.disabled = true;
    loginButton.setAttribute('aria-busy','true');
    try {
    // Initialize parsed for the current operation.
    // Initialize parsed for the current operation.
    // API origin is controlled by the deployed frontend configuration, never by end users.
    if (!expectedApi) throw new Error("The service is not configured yet. Please contact the administrator.");
    const proposed = expectedApi;
    const parsed = new URL(proposed);
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
      throw new Error("The service configuration is invalid. Please contact the administrator.");
    }
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) {
      throw new Error("A secure backend connection is required.");
    }
    const healthResponse = await fetch(`${proposed}/api/health`, { signal: AbortSignal.timeout(12000) });
    if (!healthResponse.ok) throw new Error("Backend health check failed.");
    const healthCheck = await healthResponse.json();
    if (healthCheck.environment !== APP_ENV)
      throw new Error(`Blocked cross-environment login. This app is ${APP_ENV}, but the API is ${healthCheck.environment || "unknown"}.`);

    // Initialize response for the current operation.
    // Initialize response for the current operation.
    const response = await fetch(`${proposed}/api/login`, {
      // Set the method option for this operation.
      // Set the method option for this operation.
      method: "POST",
      // Set the headers option for this operation.
      // Set the headers option for this operation.
      headers: { "Content-Type": "application/json", "X-StudyBuddy-Environment": APP_ENV },
      // Set the body option for this operation.
      // Set the body option for this operation.
      body: JSON.stringify({
        // Set the name option for this operation.
        // Set the name option for this operation.
        name: $("username").value,
        // Set the password option for this operation.
        // Set the password option for this operation.
        password: $("password").value,
        // Set the register option for this operation.
        // Set the register option for this operation.
        register: authMode === "signup",
        // Close the current expression or block.
      // Close the current expression or block.
      }),
      // Set the signal option for this operation.
      // Set the signal option for this operation.
      signal: AbortSignal.timeout(30000),
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Initialize data for the current operation.
    // Initialize data for the current operation.
    const data = await response.json().catch(() => {
      // Stop this operation with a clear failure.
      // Stop this operation with a clear failure.
      throw new Error(
        // Supply this literal value to the enclosing operation.
        // Close the current expression or block.
        "The API returned HTML instead of JSON. Check the API origin and /api/login route.",
        // Close the current expression or block.
      // Close the current expression or block.
      );
      // Close the current expression or block.
    // Close the current expression or block.
    });
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (!response.ok) {
      const details = Array.isArray(data.details) ? data.details.map(item => item.message).filter(Boolean).join(" ") : "";
      const message = details || data.error || (authMode === "signup" ? "Could not create account." : "Could not log in.");
      $("auth-feedback").textContent = message;
      $("auth-feedback").hidden = false;
      throw new Error(message);
    }
    // Supply this expression to the enclosing operation.
    // Apply the following behavior only when its condition matches.
    if (data.confirmationRequired) {
      // Run $ with the arguments below.
      $("password").value = "";
      // Run $ with the arguments below.
      setAuthMode("login");
      // Run toast with the arguments below.
      $("auth-feedback").textContent = data.message || "Check your email to confirm your account, then log in.";
      $("auth-feedback").hidden = false;
      toast(data.message || "Check your email to confirm your account.");
      // Return the result to the calling operation.
      return;
    } // Require email confirmation before attempting authenticated API calls.
    // Supply this expression to the enclosing operation.
    origin = proposed;
    // Supply this expression to the enclosing operation.
    // Run saveSession with the arguments below.
    saveSession(data);
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    username = data.name;
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    chatId = "";
    // Supply this expression to the enclosing operation.
    // Run safeLocal.setItem with the arguments below.
    sources = [];
    // Run safeLocal.setItem with the arguments below.
    // Run safeLocal.setItem with the arguments below.
    safeLocal.setItem(`studyspace-${APP_ENV}-api`, origin);
    // Run safeSession.setItem with the arguments below.
    // Run safeSession.setItem with the arguments below.
    safeSession.setItem(`studyspace-${APP_ENV}-token`, token);
    // Run safeSession.setItem with the arguments below.
    // Run safeSession.setItem with the arguments below.
    safeSession.setItem(`studyspace-${APP_ENV}-user`, username);
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("password").value = "";
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await openBuffer();
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await connect();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("account-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Your workspace is connected.");
    } finally {
      loginButton.disabled = false;
      loginButton.removeAttribute('aria-busy');
    }
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Validate and authenticate without exposing DeepSeek credentials to the browser.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("forget-topics").addEventListener(
  // Allow targeted removal of inferred memory.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async () => {
    // Supply this expression to the enclosing operation.
    // Continue the current transformation.
    profile = {
      // Continue the current transformation.
      // Continue the current transformation.
      ...profile,
      // Continue the current transformation.
      // Set the frequentSubjects option for this operation.
      ...(await api("/profile/topics", { method: "DELETE" })),
      // Set the frequentSubjects option for this operation.
      // Set the frequentSubjects option for this operation.
      frequentSubjects: {},
      // Set the lastStyle option for this operation.
      // Set the lastStyle option for this operation.
      lastStyle: undefined,
      // Close the current expression or block.
    // Close the current expression or block.
    };
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("learned-topics").textContent =
      // Supply this literal value to the enclosing operation.
      // Close the current expression or block.
      "Learned topics and response style cleared.";
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Allow targeted removal of inferred memory.
// Restore an explicitly used response format only with memory enabled.
// Supply this expression to the enclosing operation.
async function connect() {
  const check = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(12000) }).then(r => r.json());
  if (check.environment !== APP_ENV) throw new Error("Wrong backend environment. Sign-in has been blocked.");
  // Supply this expression to the enclosing operation.
  // Run $ with the arguments below.
  profile = await api("/profile");
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("account-name").textContent = profile.displayName || profile.name;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("account-state").textContent = "Supabase workspace";
  // Initialize health for the current operation.
  // Initialize health for the current operation.
  const health = await fetch(`${origin}/api/health`).then(
    // Run response.json with the arguments below.
    (response) =>
      // Run response.json with the arguments below.
      // Run response.json with the arguments below.
      response.json(),
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Run setConnection with the arguments below.
  // Run setConnection with the arguments below.
  setConnection(
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    health.aiConfigured
      ? // Supply this expression to the enclosing operation.
        // Supply this expression to the enclosing operation.
        `${APP_ENV} · DeepSeek ready`
      : // Supply this expression to the enclosing operation.
        // Close the current expression or block.
        `${APP_ENV} · AI key needed`,
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Run renderProgress with the arguments below.
  // Run renderProgress with the arguments below.
  renderProgress();
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (profile.personalization && profile.lastStyle)
    $("style").value = profile.lastStyle; // Restore an explicitly used response format only with memory enabled.
  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await refreshChats();
  window.dispatchEvent(new Event("studybuddy:chats-updated"));
  // Apply the following behavior only when its condition matches.
  // Apply the following behavior only when its condition matches.
  if (chats.length) await loadChat(chats[0].id);
  // Handle the alternative case.
  // Handle the alternative case.
  else {
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("messages").replaceChildren();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("welcome").hidden = false;
    // Run renderSources with the arguments below.
    // Run renderSources with the arguments below.
    renderSources();
    // Close the current expression or block.
  // Close the current expression or block.
  }
} // Load the signed-in account's current state and AI readiness.
// Forget the signed-out account's browser cache and visible state.
// Wait for this asynchronous operation before continuing.
async function clearSession() {
  resetLibraryView(); // Clear user-specific Library metadata immediately on sign-out.

  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await persistence.clearData();
  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await persistence.destroy();
  // Run ydoc.destroy with the arguments below.
  // Run ydoc.destroy with the arguments below.
  ydoc.destroy();
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  persistence = null;
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  token = "";
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  username = "guest";
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  chatId = "";
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  chats = [];
  // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  sources = [];
  // Supply this expression to the enclosing operation.
  // Run safeSession.removeItem with the arguments below.
  profile = {};
  // Run safeSession.removeItem with the arguments below.
  // Run safeSession.removeItem with the arguments below.
  safeSession.removeItem(`studyspace-${APP_ENV}-token`);
  // Run safeSession.removeItem with the arguments below.
  safeSession.removeItem(`studyspace-${APP_ENV}-refresh`);
  // Run safeSession.removeItem with the arguments below.
  safeSession.removeItem(`studyspace-${APP_ENV}-expiry`);
  // Clear Supabase session credentials on logout.
  refreshToken = "";
  expiresAt = 0; // Clear Supabase session credentials on logout.
  // Run safeSession.removeItem with the arguments below.
  // Run safeSession.removeItem with the arguments below.
  safeSession.removeItem(`studyspace-${APP_ENV}-user`);
  // Wait for this asynchronous operation before continuing.
  // Wait for this asynchronous operation before continuing.
  await openBuffer();
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("messages").replaceChildren();
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("welcome").hidden = false;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("account-name").textContent = "Your workspace";
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("account-state").textContent = "Connect your API";
  // Run setConnection with the arguments below.
  // Run setConnection with the arguments below.
  setConnection("Preview · API not connected");
  // Run renderChats with the arguments below.
  // Run renderChats with the arguments below.
  renderChats();
  // Run renderSources with the arguments below.
  // Run renderSources with the arguments below.
  renderSources();
  // Run renderProgress with the arguments below.
  // Run renderProgress with the arguments below.
  renderProgress();
} // Forget the signed-out account's browser cache and visible state.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("logout").addEventListener(
  // Revoke the server session and remove local content.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async () => {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (token) await api("/logout", { method: "POST" });
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await clearSession();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("account-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Signed out. Local drafts and cached chats were cleared.");
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Revoke the server session and remove local content.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("settings-open").addEventListener("click", () => {
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("memory-enabled").checked = Boolean(profile.personalization);
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("achievements-enabled").checked = Boolean(profile.achievements);
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("interests").value = profile.interests || "";
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("difficulty").value = profile.difficulty || "beginner";
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("preferences").value = profile.preferences || "";
  $("display-name").value = profile.displayName || "";
  $("custom-prompt").value = profile.customPrompt || "";
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("learned-topics").textContent = profile.personalization
    ? // Make inferred preferences inspectable.
      // Run Object.entries with the arguments below.
      `Learned topics: ${
        // Run Object.entries with the arguments below.
        // Run Object.entries with the arguments below.
        Object.entries(profile.frequentSubjects || {})
          // Continue the current transformation.
          // Continue the current transformation.
          .map(([topic, count]) => `${topic} (${count})`)
          // Continue the current transformation.
          // Make inferred preferences inspectable.
          .join(", ") || "none yet"
        // Make inferred preferences inspectable.
      // Make inferred preferences inspectable.
      }. Last response style: ${profile.lastStyle || "not saved"}.`
    : "Learned topics are not used while memory is off."; // Make inferred preferences inspectable.
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("settings-dialog").showModal();
}); // Populate editable memory from saved preferences.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("settings-form").addEventListener(
  // Save explicit personalization choices.
  // Run handle with the arguments below.
  "submit",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async (event) => {
    // Run event.preventDefault with the arguments below.
    // Run event.preventDefault with the arguments below.
    event.preventDefault();
    // Initialize data for the current operation.
    // Initialize data for the current operation.
    const data = {
      // Set the personalization option for this operation.
      // Set the personalization option for this operation.
      personalization: $("memory-enabled").checked,
      // Set the achievements option for this operation.
      // Set the achievements option for this operation.
      achievements: $("achievements-enabled").checked,
      // Set the interests option for this operation.
      // Set the interests option for this operation.
      interests: $("interests").value,
      // Set the difficulty option for this operation.
      // Set the difficulty option for this operation.
      difficulty: $("difficulty").value,
      // Set the preferences option for this operation.
      // Set the preferences option for this operation.
      preferences: $("preferences").value,
      displayName: $("display-name").value.trim(),
      customPrompt: $("custom-prompt").value.trim(),
      // Close the current expression or block.
    // Close the current expression or block.
    };
    // Supply this expression to the enclosing operation.
    // Continue the current transformation.
    profile = {
      // Continue the current transformation.
      // Continue the current transformation.
      ...profile,
      // Continue the current transformation.
      // Close the current expression or block.
      ...(await api("/profile", { method: "PUT", body: JSON.stringify(data) })),
      // Close the current expression or block.
    // Close the current expression or block.
    };
    // Run renderProgress with the arguments below.
    // Run renderProgress with the arguments below.
    renderProgress();
    $("account-name").textContent = profile.displayName || profile.name || "Your workspace";
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("settings-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Your preferences are saved.");
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Save explicit personalization choices.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("forget-memory").addEventListener(
  // Provide a direct memory reset without deleting work.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async () => {
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await api("/profile/memory", { method: "DELETE" });
    // Supply this expression to the enclosing operation.
    // Run renderProgress with the arguments below.
    profile = {};
    // Run renderProgress with the arguments below.
    // Run renderProgress with the arguments below.
    renderProgress();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("settings-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast(
      // Supply this literal value to the enclosing operation.
      // Close the current expression or block.
      "Preferences and feedback were forgotten. Your conversations remain.",
      // Close the current expression or block.
    // Close the current expression or block.
    );
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Provide a direct memory reset without deleting work.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("delete-chat").addEventListener(
  // Confirm destructive chat deletion and clear its offline copy.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async () => {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (!chatId) throw new Error("No conversation is selected.");
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (!confirm("Delete this conversation and its sources permanently?"))
      // Return the result to the calling operation.
      // Return the result to the calling operation.
      return;
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await api(`/chats/${chatId}`, { method: "DELETE" });
    // Run drafts.delete with the arguments below.
    // Run drafts.delete with the arguments below.
    drafts.delete(chatId);
    // Run snapshots.delete with the arguments below.
    // Run snapshots.delete with the arguments below.
    snapshots.delete(chatId);
    // Supply this expression to the enclosing operation.
    // Supply this expression to the enclosing operation.
    chatId = "";
    // Supply this expression to the enclosing operation.
    // Run $ with the arguments below.
    sources = [];
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("messages").replaceChildren();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("welcome").hidden = false;
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("question").value = "";
    // Run renderSources with the arguments below.
    // Run renderSources with the arguments below.
    renderSources();
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await refreshChats();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("settings-dialog").close();
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Confirm destructive chat deletion and clear its offline copy.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("delete-account").addEventListener(
  // Provide complete account deletion with an explicit warning.
  // Run handle with the arguments below.
  "click",
  // Run handle with the arguments below.
  // Run handle with the arguments below.
  handle(async () => {
    // Apply the following behavior only when its condition matches.
    // Apply the following behavior only when its condition matches.
    if (
      // Supply this expression to the enclosing operation.
      // Supply this literal value to the enclosing operation.
      !confirm(
        // Supply this literal value to the enclosing operation.
        // Close the current expression or block.
        "Permanently delete your account, all chats, sources, preferences, and progress?",
        // Close the current expression or block.
      // Close the current expression or block.
      )
      // Close the current expression or block.
    // Close the current expression or block.
    )
      // Return the result to the calling operation.
      // Return the result to the calling operation.
      return;
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await api("/account", { method: "DELETE" });
    resetLibraryView();
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await clearSession();
    // Run $ with the arguments below.
    // Run $ with the arguments below.
    $("settings-dialog").close();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast("Your account and its data were deleted.");
    // Close the current expression or block.
  // Close the current expression or block.
  }),
); // Provide complete account deletion with an explicit warning.
// Run $ with the arguments below.
// Run $ with the arguments below.
$("explore-example").addEventListener("click", () => {
  // Run changeTab with the arguments below.
  // Run changeTab with the arguments below.
  changeTab("chat");
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("welcome").hidden = true;
  // Run $ with the arguments below.
  // Run $ with the arguments below.
  $("messages").replaceChildren();
  // Run renderUser with the arguments below.
  // Run renderUser with the arguments below.
  renderUser("What is active recall, and how can I try it?");
  // Run renderAnswer with the arguments below.
  // Run renderAnswer with the arguments below.
  renderAnswer(
    // Supply this expression to the enclosing operation.
    // Set the content option for this operation.
    {
      // Set the content option for this operation.
      // Set the content option for this operation.
      content:
        // Supply this literal value to the enclosing operation.
        // Set the citations option for this operation.
        "### Turn remembering into practice\n\n**Active recall means trying to retrieve an idea before looking at the answer.** In this sample note, the practice loop is: close your notes, answer one question, then check and correct your answer. [S1]\n\n1. Pick one concept from your notes.\n2. Explain it in your own words without looking.\n3. Compare your explanation with the source.\n4. Revisit the part you missed.\n\n**Try next:** turn one definition into a question and answer it tomorrow.",
      // Set the citations option for this operation.
      // Set the citations option for this operation.
      citations: [
        // Supply this expression to the enclosing operation.
        // Set the label option for this operation.
        {
          // Set the label option for this operation.
          // Set the label option for this operation.
          label: "S1",
          // Set the name option for this operation.
          // Set the name option for this operation.
          name: "Example study note (illustrative)",
          // Set the passage option for this operation.
          // Set the passage option for this operation.
          passage: 1,
          // Set the text option for this operation.
          // Set the text option for this operation.
          text: "Active recall practice: close your notes, answer a question from memory, then check the source and correct your answer. Revisit difficult concepts later.",
          // Close the current expression or block.
        // Close the current expression or block.
        },
        // Close the current expression or block.
      // Close the current expression or block.
      ],
      // Close the current expression or block.
    // Close the current expression or block.
    },
    // Show one explicitly labeled, locally authored demonstration.
    // Show one explicitly labeled, locally authored demonstration.
    "sample",
    // Show one explicitly labeled, locally authored demonstration.
    // Close the current expression or block.
    true,
    // Close the current expression or block.
  // Close the current expression or block.
  );
}); // Show one explicitly labeled, locally authored demonstration.
// Run window.addEventListener with the arguments below.
// Run window.addEventListener with the arguments below.
window.addEventListener("offline", () => {
  // Run setConnection with the arguments below.
  // Run setConnection with the arguments below.
  setConnection("Offline · drafts saved");
  // Run toast with the arguments below.
  // Run toast with the arguments below.
  toast("You can keep writing. AI and uploads resume when you reconnect.");
}); // Explain what remains available without a network.
// Run window.addEventListener with the arguments below.
// Run window.addEventListener with the arguments below.
window.addEventListener("online", () => {
  // Run setConnection with the arguments below.
  // Run setConnection with the arguments below.
  setConnection(
    // Supply this expression to the enclosing operation.
    // Close the current expression or block.
    token ? "Online · ready to reconnect" : "Preview · API not connected",
    // Close the current expression or block.
  // Close the current expression or block.
  );
  // Run toast with the arguments below.
  // Run toast with the arguments below.
  toast("You’re back online. Your draft is ready to send.");
}); // Require deliberate submission rather than automatic queued uploads.
// ---------- User-owned, tagged Library ----------
// Keep library state in memory for the active account only. Files live in private Supabase Storage.
const libraryState = {items:[],total:0,offset:0,selected:null,objectUrl:null};
const libraryCategoryNames = {summary:'Summary',review:'Review',flashcards:'Flashcards',textbook:'Textbook',slides:'Slides',planner:'Planner',image:'Image',audio:'Audio',video:'Video',document:'Document',other:'Other'};
const libraryCategoryIcons = {summary:'✍',review:'✧',flashcards:'▣',textbook:'📖',slides:'▤',planner:'◷',image:'▧',audio:'♫',video:'▷',document:'▤',other:'✿'};
let librarySearchTimer;
let libraryRequest = 0;
function resetLibraryView() {
  libraryRequest++;
  libraryState.items=[];
  libraryState.total=0;
  libraryState.offset=0;
  libraryState.selected=null;
  $('library-grid').replaceChildren(element('div','library-empty','✿ Sign in to see your collection.'));
  $('library-total').textContent='Your private collection';
  $('library-more').hidden=true;
}
function makeTagChip(label) {
  const chip=element('span','library-tag',`#${label}`);
  chip.title=`Tag: ${label}`;
  return chip;
}
function renderLibrary() {
  const grid=$('library-grid');
  grid.replaceChildren();
  $('library-total').textContent=`${libraryState.total} saved ${libraryState.total === 1?'item':'items'}`;
  $('library-more').hidden=libraryState.offset>=libraryState.total;
  if(!libraryState.items.length){
    grid.append(element('div','library-empty',libraryState.total?'No items loaded.':'✿ Nothing here yet. Make a study guide, flashcards, or upload media to start your collection.'));
    return;
  }
  for (const item of libraryState.items) {
    const card=element('article','library-card');
    const glyph=element('div',`library-glyph category-${item.category}`,libraryCategoryIcons[item.category]||'✿');
    const content=element('div','library-card-body');
    const heading=element('h3','',item.title);
    const meta=element('p','library-card-meta',`${libraryCategoryNames[item.category]||'Item'} · ${new Date(item.created_at).toLocaleDateString()}`);
    const tags=element('div','library-tags');
    (item.tags||[]).slice(0,4).forEach(t=>tags.append(makeTagChip(t)));
    content.append(heading,meta,tags);
    const open=element('button','library-open',item.storage_path?'View / download ↗':'Open creation ↗');
    open.type='button';
    open.addEventListener('click',()=>void openLibraryItem(item.id).catch(err=>toast(err.message)));
    card.append(glyph,content,open);
    grid.append(card);
  }
}
async function loadLibrary(append=false) {
  if(!token){resetLibraryView();return;}
  const params = new URLSearchParams();
  const category=$('library-category').value;
  const tag=$('library-tag').value.trim();
  const search=$('library-search').value.trim();
  if(category) params.set('category',category);
  if(tag) params.set('tag',tag);
  if(search) params.set('q',search);
  params.set('offset',append?String(libraryState.offset):'0');
  $('library-total').textContent='Loading your collection…';
  const currentRequest = ++libraryRequest;
  const data=await api(`/library?${params}`);
  if (currentRequest !== libraryRequest) return; // A newer search/filter superseded this response.
  libraryState.items=append?[...libraryState.items,...data.items]:data.items;
  libraryState.offset=data.nextOffset;
  libraryState.total=data.total;
  renderLibrary();
}
function closeLibraryObject() {
  if(libraryState.objectUrl) URL.revokeObjectURL(libraryState.objectUrl);
  libraryState.objectUrl=null;
}
async function openLibraryItem(id) {
  closeLibraryObject();
  const item=await api(`/library/${id}`);
  libraryState.selected=item;
  $('library-detail-title').textContent=item.title;
  $('library-edit-title').value=item.title;
  $('library-edit-category').value=item.category;
  $('library-edit-tags').value=(item.tags||[]).join(', ');
  const preview=$('library-preview');
  preview.replaceChildren();
  if(item.content) {
    const note=element('p','muted small','Generated learning material · use Preview to practise or export');
    const button=element('button','primary','Open preview ✧');
    button.type='button';
    button.addEventListener('click',()=>{
      $('library-detail-dialog').close();
      showArtifact(item.content,item.category);
    });
    preview.append(note,button);
  } else if(item.storage_path) {
    const note=element('p','muted small',`Private upload · ${Math.ceil(item.bytes/1024)} KB`);
    const getFile=async()=>api(`/library/${id}/download`,{binary:true});
    if (/^(image|audio|video)\//.test(item.mime_type||'')) {
      const blob=await getFile();
      libraryState.objectUrl=URL.createObjectURL(blob);
      const tag=item.category==='image'?'img':item.category==='audio'?'audio':'video';
      const player=document.createElement(tag);
      player.src=libraryState.objectUrl;
      player.className='library-media';
      if(tag==='img'){player.loading='lazy';player.decoding='async';}
      if(tag!=='img'){player.controls=true;player.preload='metadata';}
      player.setAttribute('aria-label',`Preview of ${item.title}`);
      preview.append(player);
    }
    const download=element('button','secondary','Download original ↓');
    download.type='button';
    download.addEventListener('click',()=>void (async()=>{
      const blob=await getFile();
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;link.download=item.title;link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    })().catch(err=>toast(err.message)));
    preview.append(note,download);
  }
  $('library-detail-dialog').showModal();
}
$('library-detail-dialog').addEventListener('close',()=>{closeLibraryObject();libraryState.selected=null;});
$('library-refresh').addEventListener('click',()=>void loadLibrary().catch(err=>toast(err.message)));
$('library-more').addEventListener('click',()=>void loadLibrary(true).catch(err=>toast(err.message)));
for(const id of ['library-search','library-tag']) $(id).addEventListener('input',()=>{
  clearTimeout(librarySearchTimer);
  librarySearchTimer=setTimeout(()=>void loadLibrary().catch(err=>toast(err.message)),250);
});
$('library-category').addEventListener('change',()=>void loadLibrary().catch(err=>toast(err.message)));
$('library-upload').addEventListener('click',()=>{
  if(!token){$('account-dialog').showModal();return;}
  $('library-file-input').click();
});
$('library-file-input').addEventListener('change',event=>void (async()=>{
  const file=event.target.files?.[0];
  if(!file)return;
  try {
    if(file.size>10*1024*1024)throw new Error('Please choose a file up to 10 MB.');
    $('library-upload').disabled=true;
    await api('/library/upload',{
      method:'POST',headers:{'Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(file.name)},body:file,
    });
    await loadLibrary();
    toast('✿ Your media was securely added to My Library.');
  } finally { $('library-upload').disabled=false; event.target.value=''; }
})().catch(err=>toast(err.message)));
$('library-edit-form').addEventListener('submit',event=>void (async()=>{
  event.preventDefault();
  const item=libraryState.selected;
  if(!item)return;
  const tags=[...new Set($('library-edit-tags').value.split(',').map(v=>v.trim().toLowerCase()).filter(Boolean))];
  if(tags.length>10 || tags.some(v=>v.length>24)) throw new Error('Use up to 10 tags, each 24 characters or fewer.');
  await api(`/library/${item.id}`,{method:'PUT',body:JSON.stringify({title:$('library-edit-title').value,category:$('library-edit-category').value,tags})});
  $('library-detail-dialog').close();
  await loadLibrary();
  toast('✿ Title, category and tags updated.');
})().catch(err=>toast(err.message)));
$('library-delete').addEventListener('click',()=>void (async()=>{
  const item=libraryState.selected;
  if(!item || !confirm(`Permanently delete “${item.title}” from your Library?`)) return;
  await api(`/library/${item.id}`,{method:'DELETE'});
  $('library-detail-dialog').close();
  await loadLibrary();
  toast('The item was removed from your Library.');
})().catch(err=>toast(err.message)));

await openBuffer(); // Restore offline drafts before accepting input.
// Apply the following behavior only when its condition matches.
// Apply the following behavior only when its condition matches.
if (token) {
  // Supply this expression to the enclosing operation.
  // Wait for this asynchronous operation before continuing.
  try {
    // Wait for this asynchronous operation before continuing.
    // Wait for this asynchronous operation before continuing.
    await connect();
    // Supply this expression to the enclosing operation.
  // Supply this expression to the enclosing operation.
  } catch (error) {
    // Supply this expression to the enclosing operation.
    // Run renderChats with the arguments below.
    chats = snapshots.get("chat-list") || [];
    // Run renderChats with the arguments below.
    // Run renderChats with the arguments below.
    renderChats();
    // Run toast with the arguments below.
    // Run toast with the arguments below.
    toast(error.message);
    // Close the current expression or block.
  // Close the current expression or block.
  }
} // Restore the existing session or show its connection failure.
// Apply the following behavior only when its condition matches.
// Apply the following behavior only when its condition matches.
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register(`${(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")}sw.js`, { scope: (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/") }).catch(() => {}); // Cache only the static app shell for offline reopening.



// Keep the independent studios and folder UI wired to the existing authenticated API.
initStudyBuddyStudio({
  api, generate, toast, ensureChat, changeTab,
  getChats: () => chats, getCurrentChatId: () => chatId,
  getToken: () => token, refreshChats,
  toHtml: markdown,
});
