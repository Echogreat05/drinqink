import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, GlassWater } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — DrinqInk" },
      { name: "description", content: "Browse drinks by category: beer, soft drinks, water crates, cocktails, spirits, wine, and more." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [cats, setCats] = useState<{ id: string; name: string; slug: string; description: string | null }[]>([]);
  useEffect(() => {
    supabase.from("categories").select("id,name,slug,description").order("display_order").then(({ data }: { data: typeof cats | null }) => setCats(data ?? []));
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mb-16">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">By category</p>
            <h1 className="font-display text-5xl lg:text-7xl font-light leading-[1.05]">
              Explore by <span className="italic text-gradient-gold">style</span>.
            </h1>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cats.map((c) => (
              <Link
                key={c.id}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="group relative p-8 rounded-lg border border-border bg-card hover:border-primary/40 transition-all aspect-[5/3] flex flex-col justify-between"
              >
                <GlassWater className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="font-display text-3xl mb-1">{c.name}</h2>
                  <div className="flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
