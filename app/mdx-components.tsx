import * as FilesComponents from "@/components/files";
import * as GithubInfoComponents from "@/components/github-info";
import * as StepsComponents from "@/components/steps";
import * as TabsComponents from "@/components/tabs";
import * as Twoslash from "fumadocs-twoslash/ui";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ImageZoom } from "./components/image-zoom";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...components,
    ...defaultMdxComponents,
    img: props => <ImageZoom {...props} />,
    ...GithubInfoComponents,
    ...FilesComponents,
    ...TabsComponents,
    ...StepsComponents,
    ...Twoslash,
  };
}
