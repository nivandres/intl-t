import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

// The index is built once and searched in the browser, so it also works on static hosting.
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // https://docs.orama.com/open-source/supported-languages
  language: "english",
});
