import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import type { ReactNode } from "react";

const inter = Noto_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intl-T",
  description:
    "Intl-T is a fully typed object-based i18n translation library for TypeScript, React, and Next.js. Fully Type-Safe, Fast & Lightweight, Framework Agnostic, Rich API, Formatting helpers, Next.js Navigation.",
  authors: {
    name: "Ivan Vargas",
    url: "https://nivan.dev",
  },
  creator: "@nivandres",
  openGraph: {
    images: {
      url: "https://raw.githubusercontent.com/nivandres/intl-t/main/assets/banner.webp",
      alt: "Intl-T Banner Image",
    },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
