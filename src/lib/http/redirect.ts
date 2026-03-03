// Prevent open redirects by allowing only same-site relative paths.
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback = "/",
) {
  if (!next) return fallback;

  // Must be a relative path that starts with "/"
  if (!next.startsWith("/")) return fallback;

  // Disallow protocol-relative URLs
  if (next.startsWith("//")) return fallback;

  return next;
}

/**
 * Production-ready:
 * - Prefer NEXT_PUBLIC_SITE_URL if set (e.g. https://kanban.example.com)
 * - Otherwise fall back to request origin (local/dev)
 */
export function getSiteOrigin(requestOrigin: string) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? requestOrigin;
}
