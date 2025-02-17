import { cache } from "react";

export const LOCALE_HEADERS_KEY = "x-locale";
export const PATH_HEADERS_KEY = "x-path";

export const getHeaders = cache(async () => {
  try {
    const { headers } = await import("next/headers");
    return await headers();
  } catch {
    return new Headers();
  }
});

export async function getHeadersRequestLocale(key = LOCALE_HEADERS_KEY) {
  return (await getHeaders()).get(key);
}

export async function getHeadersRequestPathname(key = PATH_HEADERS_KEY) {
  return (await getHeaders()).get(key);
}
