/**
 * Consistent error classification, separate from Express for easy regression tests.
 * Do not return raw 5xx provider errors to public clients.
 */
export function apiErrorStatus(error) {
  const message = String(error?.message ?? "");
  // Some StudySpace revisions lose error.status when wrapping setup failures.
  if (error?.code === "SUPABASE_NOT_CONFIGURED" ||
      /^Configure SUPABASE_(?:URL|ANON_KEY|SERVICE_ROLE_KEY)/.test(message)) return 503;
  if (error?.type === "entity.too.large") return 413;
  if (error?.type === "entity.parse.failed" || error?.name === "ZodError") return 400;
  const code = Number(error?.status ?? error?.statusCode);
  if (code === 503) return 503;
  if (Number.isInteger(code) && code >= 400 && code <= 499) return code;
  return 500;
}

export function apiErrorMessage(error, status, production = false) {
  if (!production) {
    if (error?.name === "ZodError") return "Please check the submitted information.";
    return String(error?.message || "Request failed.").slice(0, 240);
  }
  const safe = {
    400: "Please check the submitted information.",
    401: "Please sign in again.",
    403: "This action is not permitted.",
    404: "The requested item was not found.",
    409: "The request conflicts with the current state.",
    413: "The uploaded content is too large.",
    429: "Too many requests. Please try again shortly.",
    503: "Service temporarily unavailable. Please try again later.",
  };
  return safe[status] || "We could not complete that request. Please try again.";
}
