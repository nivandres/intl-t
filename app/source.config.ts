import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs";
import { remarkAutoTypeTable, createGenerator } from "fumadocs-typescript";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
  dir: "../docs",
});

const generator = createGenerator();

export default defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    remarkPlugins: [[remarkAutoTypeTable, { generator }]],
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "tokyo-night",
      },
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? []), transformerTwoslash({ typesCache: createFileSystemTypesCache() })],
    },
  },
});
