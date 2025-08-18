import { Button } from "@/components/ui/button";
import { getMDXComponents } from "@/mdx-components";
import "fumadocs-ui/components/banner";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { Book, Github, Shield, Zap, Globe, Package, Layers, Code } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import HeroCode from "./code/hero.mdx";
import InstallCode from "./code/install.mdx";

export default function HomePage() {
  return (
    <>
      <section className="flex items-center justify-center space-y-24 flex-wrap w-full my-12">
        <div className="max-w-lg my-24 space-y-2">
          <h1 className="text-6xl font-extrabold text-center">Intl-T.</h1>
          <GithubInfo owner="nivandres" repo="intl-t" className="justify-center !flex-row" />
          <p className="text-xl text-center text-fd-muted-foreground">
            A Fully-Typed Object-Based i18n Translation Library for TypeScript, React, and Next.js
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/docs" aria-label="Open documentation">
              <Button>
                <Book className="mr-2 size-4" />
                Intl-T Documentation
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-150 max-w-full [&_pre]:h-60 mx-12">
          <HeroCode components={getMDXComponents()} />
        </div>
      </section>
      <section className="max-w-screen-xl mx-auto px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Feature
          icon={<Shield />}
          title="Fully Type-Safe"
          desc="Auto-completion everywhere: at translations, keys, with variables, and more."
        />
        <Feature
          icon={<Zap />}
          title="Fast & Lightweight"
          desc="Lightweight bundle with zero external dependencies, tree shakeable, and optimized for performance."
        />
        <Feature icon={<Globe />} title="Framework Agnostic" desc="Works in TypeScript, React, Next.js but is compatible everywhere." />
        <Feature icon={<Package />} title="Rich API" desc="Object-based message nodes. Readable and maintainable. Super flexible." />
        <Feature
          icon={<Code />}
          title="Formatting Helpers"
          desc="Has out of the box variable injection with an extended ICU format support."
        />
        <Feature
          icon={<Layers />}
          title="Next.js Navigation"
          desc="Seamless RSC integrations with a customizable navigation system, optimized for performance."
        />
      </section>

      <section className="max-w-screen-xl mx-auto my-24 flex flex-wrap justify-center items-center gap-16">
        <Image
          className="w-xl max-w-full"
          src="https://raw.githubusercontent.com/nivandres/intl-t/main/assets/banner.webp"
          alt="banner"
          width={1366}
          height={768}
        />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-bold text-center">Installing</h2>
          <p className="text-fd-muted-foreground text-center">Use your preferred package manager.</p>
          <div className="w-sm max-w-full">
            <InstallCode components={getMDXComponents()} />
          </div>
          <div className="flex gap-3">
            <Link href="/docs/quick-start" aria-label="Read the Quick Start">
              <Button>
                <Book className="mr-2 size-4" />
                Quick Start
              </Button>
            </Link>
            <Link href="https://github.com/nivandres/intl-t" aria-label="Star on GitHub">
              <Button>
                <Github className="mr-2 size-4" />
                Star Repo
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center mb-12 mx-auto">
        <span className="text-fd-muted-foreground text-center">
          Developed by <Link href="https://nivan.dev">@nivandres</Link>
        </span>
      </section>
    </>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-fd-card p-5">
      <div className="flex items-center gap-3 mb-2 text-fd-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-sm text-fd-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
