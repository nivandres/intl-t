import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Book, Download, Github, MessageSquare } from "lucide-react";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          id="a"
          viewBox="0 0 160 160"
          className="size-5 stroke-fd-foreground *:fill-none *:stroke-[11px]"
        >
          <circle cx="80" cy="80" r="74.5" />
          <line x1="80" y1="154.5" x2="80" y2="5.5" />
          <line x1="11" y1="45" x2="149" y2="45" />
          <line x1="11" y1="115" x2="149" y2="115" />
          <ellipse cx="80" cy="80" rx="45" ry="74.5" />
        </svg>
        Intl-T
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      icon: <Book />,
      text: "Docs",
      url: "/docs",
    },
    {
      icon: <MessageSquare />,
      text: "Contact",
      url: "https://discord.gg/5EbCXKpdyw",
    },
    {
      icon: <Github />,
      text: "Github",
      url: "https://github.com/nivandres/intl-t",
    },
    {
      icon: <Download />,
      text: "NPM",
      url: "https://www.npmjs.com/package/intl-t",
    },
  ],
  githubUrl: "https://github.com/nivandres/intl-t",
};
