/**
 * Safe error handler for API routes.
 * Logs the real error server-side but returns a generic message to clients.
 * Prevents stack trace leaks and internal path exposure.
 */
export function safeErrorResponse(error: unknown, context?: string): string {
  // Log the full error server-side for debugging
  if (context) {
    console.error(`[API Error] ${context}:`, error);
  } else {
    console.error("[API Error]", error);
  }

  // Return generic message to the client — NEVER expose internals
  return "An unexpected error occurred. Please try again later.";
}

/**
 * Strips HTML tags from a string to prevent XSS when storing user input.
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}
