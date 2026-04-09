import Link from "next/link";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { urlRedirects } from "@/lib/db/schema/seo";
import { PageHeader } from "../../_components/page-header";
import { ArrowRight, Globe, ShoppingBag, FolderTree } from "lucide-react";

export default async function SeoPage() {
  const [redirectCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(urlRedirects);

  const cards = [
    {
      title: "URL Redirects",
      description: `${redirectCount?.count ?? 0} active redirect${(redirectCount?.count ?? 0) !== 1 ? "s" : ""}`,
      href: "/admin/seo/redirects",
      icon: Globe,
      hasLink: true,
    },
    {
      title: "Product SEO",
      description: "Manage via product edit pages",
      href: null,
      icon: ShoppingBag,
      hasLink: false,
    },
    {
      title: "Category SEO",
      description: "Manage via category edit pages",
      href: null,
      icon: FolderTree,
      hasLink: false,
    },
  ];

  return (
    <>
      <PageHeader title="SEO Management" subtitle="Search engine optimization tools" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="group rounded-xl border border-zinc-800/80 bg-card p-6 transition-all duration-200 hover:border-zinc-700">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <card.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {card.description}
              </p>
              {card.hasLink && (
                <div className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-emerald-400 transition-colors group-hover:text-emerald-300">
                  Manage
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          );

          if (card.href) {
            return (
              <Link key={card.title} href={card.href}>
                {content}
              </Link>
            );
          }

          return (
            <div key={card.title} className="opacity-70">
              {content}
            </div>
          );
        })}
      </div>
    </>
  );
}
