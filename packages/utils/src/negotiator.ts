export function negotiator({ headers }: { headers: Headers | Record<string, string> }) {
  return new Headers(headers).get("Accept-Language")?.split(",");
}
