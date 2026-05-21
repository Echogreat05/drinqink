import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({ meta: [{ title: "Search — SipCellar" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [vendors, setVendors] = useState<{ id: string; business_name: string; slug: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  useEffect(() => {
    if (!query) { setVendors([]); setProducts([]); return; }
    const t = setTimeout(async () => {
      const [{ data: v }, { data: p }] = await Promise.all([
        supabase.from("vendors").select("id,business_name,slug").ilike("business_name", `%${query}%`).eq("status", "approved").limit(10),
        supabase.from("products").select("id,name,price").ilike("name", `%${query}%`).eq("is_active", true).limit(20),
      ]);
      setVendors(v ?? []);
      setProducts(p ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-4xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-3">Search</p>
          <h1 className="font-display text-5xl lg:text-6xl font-light mb-8">Find your <span className="italic text-gradient-gold">pour</span>.</h1>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); navigate({ to: "/search", search: { q: e.target.value } }); }}
              placeholder="Search vendors, bottles, categories..."
              className="pl-11 h-14 text-base bg-card"
            />
          </div>

          {query && (
            <div className="mt-10 space-y-10">
              <div>
                <h2 className="font-display text-2xl mb-4">Vendors</h2>
                {vendors.length === 0 ? <p className="text-muted-foreground text-sm">No vendors match.</p> : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {vendors.map((v) => (
                      <Link key={v.id} to="/vendor/$slug" params={{ slug: v.slug }} className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors">{v.business_name}</Link>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-display text-2xl mb-4">Products</h2>
                {products.length === 0 ? <p className="text-muted-foreground text-sm">No products match.</p> : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {products.map((p) => (
                      <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors flex justify-between">
                        <span>{p.name}</span>
                        <span className="text-primary">₦{p.price.toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
