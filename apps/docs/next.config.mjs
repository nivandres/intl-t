import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

// `NEXT_OUTPUT=export` builds a fully static site (GitHub Pages); otherwise a regular Next build.
const staticExport = process.env.NEXT_OUTPUT === "export";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ["typescript", "twoslash"],
  ...(staticExport
    ? { output: "export", images: { unoptimized: true } }
    : {
        async rewrites() {
          return [
            {
              source: "/docs/:path*.mdx",
              destination: "/llms.mdx/:path*",
            },
          ];
        },
      }),
};

export default withMDX(config);
