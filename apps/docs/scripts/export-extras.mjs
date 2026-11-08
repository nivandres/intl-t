// Post-processing for the static export (NEXT_OUTPUT=export), e.g. GitHub Pages.
// Static hosting has no rewrites, so the `/docs/<page>.mdx` → `/llms.mdx/<page>` rewrite from
// next.config.mjs is materialised as files, next to each page.
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const out = join(import.meta.dirname, "..", "out");
const llms = join(out, "llms.mdx");
if (!existsSync(llms)) throw new Error(`missing ${llms}: run the static build first`);

const files = dir =>
  readdirSync(dir).flatMap(name => (statSync(join(dir, name)).isDirectory() ? files(join(dir, name)) : [join(dir, name)]));

let count = 0;
for (const file of files(llms)) {
  const target = join(out, "docs", `${relative(llms, file)}.mdx`);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(file, target);
  count++;
}
console.log(`export-extras: wrote ${count} docs/*.mdx files`);
