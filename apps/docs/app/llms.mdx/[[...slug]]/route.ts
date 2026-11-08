import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export const revalidate = false;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return new NextResponse(await getLLMText(page));
}

export function generateStaticParams() {
  const params = source.generateParams();
  // A static export can't hold both the file `llms.mdx` and the folder `llms.mdx/`.
  return process.env.NEXT_OUTPUT === "export" ? params.filter(({ slug }) => slug.length > 0) : params;
}
