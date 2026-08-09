/**
 * Shopify sometimes sends the `host` query parameter as base64url (RFC 4648 §5).
 * The `@shopify/shopify-api` library expects standard base64 with `+/` and `=` padding,
 * because it uses `atob()` to decode the host. This helper converts a base64url host
 * value to standard base64 so the rest of the auth flow works correctly.
 */
export function normalizeRequestHost(request: Request): Request {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");

  if (host && /^[A-Za-z0-9\-_]+$/u.test(host)) {
    const standard = Buffer.from(host, "base64url").toString("base64");
    url.searchParams.set("host", standard);
    return new Request(url, request);
  }

  return request;
}
