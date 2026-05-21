import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { GlassWater } from "lucide-react";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — DrinqInk` },
      { name: "description", content: `Browse ${params.slug} from verified vendors on DrinqInk.` },
    ],
  }),
  component: CategoryDetailPage,
});

type Product = { id: string; name: string; slug: string; price: number; images: string[]; vendor_id: string };

function CategoryDetailPage() {
  const { slug } = Route.useParams();
  const [name, setName] = useState(slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id,name").eq("slug", slug).maybeSingle();
      if (!cat) { setLoading(false); return; }
      setName(cat.name);
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,slug,price,images,vendor_id")
        .eq("category_id", cat.id)
        .eq("is_active", true)
        .limit(60);
      setProducts(prods ?? []);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6 lg:px-10">
          <p className="text-xs tracking-widest uppercase text-primary mb-3">Category</p>
          <h1 className="font-display text-5xl lg:text-7xl font-light capitalize">{name}</h1>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="h-64 rounded-lg bg-card border border-border animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">No products in this category yet — check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all">
                  <div className="aspect-square rounded-md bg-onyx flex items-center justify-center overflow-hidden mb-3">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" /> : <GlassWater className="h-10 w-10 text-primary" />}
                  </div>
                  <h3 className="font-display text-lg truncate">{p.name}</h3>
                  <p className="text-primary font-semibold mt-1">₦{p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
