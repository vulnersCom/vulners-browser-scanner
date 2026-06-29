/**
 * Defensive sanitizers for values that flow from the scanned page or the
 * Vulners API into the DOM.
 *
 * React/JSX already escapes text content, so the text-rendering surface is
 * safe. These guard the *non-text* sinks (inline-style colors, URL path
 * segments) and bound page-controlled strings.
 */

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Allow only hex colors into inline `style`, blocking CSS injection. */
export function safeColor(color: string | undefined, fallback = 'inherit'): string {
  return color && HEX_COLOR.test(color) ? color : fallback;
}

/** Bound a page-/API-derived string to a sane maximum length. */
export function clampLength(value: string, max = 256): string {
  return value.length > max ? value.slice(0, max) : value;
}

/** Encode a value for safe inclusion as a single URL path segment. */
export function urlSegment(value: string): string {
  return encodeURIComponent(value);
}
