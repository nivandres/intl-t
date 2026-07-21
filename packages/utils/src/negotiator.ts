export function negotiator({ headers }: { headers: Headers | Record<string, string> }) {
  return new Headers(headers)
    .get("Accept-Language")
    ?.split(",")
    .map(part => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim(), q: q ? parseFloat(q) : 1 };
    })
    .filter(x => x.tag && x.tag !== "*")
    .sort((a, b) => b.q - a.q)
    .map(x => x.tag);
}
