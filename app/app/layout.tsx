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
  description: "Intl-T is a fully typed object-based i18n library for TypeScript.",
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
