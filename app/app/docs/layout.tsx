import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { DocsLayout, DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

const docOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  links: [
    {
      type: "custom",
      children: <GithubInfo owner="nivandres" repo="intl-t" />,
    },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout {...docOptions}>{children}</DocsLayout>;
}
