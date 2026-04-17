export function negotiator({ headers }: { headers: Headers | Record<string, string> }) {
  return (headers instanceof Headers ? headers.get("Accept-Language") : headers["Accept-Language"])?.split(",");
}
