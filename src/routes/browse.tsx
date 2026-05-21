import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MapPin, Star, GlassWater, Filter } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Vendors — DrinqInk" },
      { name: "description", content: "Discover vetted drinks vendors across Nigeria. Filter by state, category and rating." },
    ],
  }),
  component: BrowsePage,
});

type Vendor = {
  id: string; business_name: string; slug: string; description: string | null;
  logo_url: string | null; coverage_states: string[]; rating_avg: number | null;
  rating_count: number | null; is_featured: boolean;
};

type Product = {
  id: string; name: string; price: number; abv: number | null; volume_ml: number | null;
  stock_status: string; vendor_id: string; images: string[];
};

function BrowsePage() {
  const [q, setQ] = useState("");
  const [searchType, setSearchType] = useState<"vendors" | "products">("vendors");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    priceRange: [0, 50000],
    abvRange: [0, 60],
    inStockOnly: false,
  });

  useEffect(() => {
    (async () => {
      const [vendorData, productData] = await Promise.all([
        supabase
          .from("vendors")
          .select("id,business_name,slug,description,logo_url,coverage_states,rating_avg,rating_count,is_featured")
          .eq("status", "approved")
          .order("is_featured", { ascending: false })
          .limit(60),
        supabase
          .from("products")
          .select("id,name,price,abv,volume_ml,stock_status,vendor_id,images")
          .eq("is_active", true)
          .limit(60),
      ]);
      setVendors(vendorData.data ?? []);
      setProducts(productData.data ?? []);
      setLoading(false);
    })();
  }, []);

  const filteredVendors = vendors.filter((v) =>
    !q || v.business_name.toLowerCase().includes(q.toLowerCase())
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchesPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
    const matchesAbv = !p.abv || (p.abv >= filters.abvRange[0] && p.abv <= filters.abvRange[1]);
    const matchesStock = !filters.inStockOnly || p.stock_status === "in_stock";
    return matchesSearch && matchesPrice && matchesAbv && matchesStock;
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mb-10">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Marketplace</p>
            <h1 className="font-display text-5xl lg:text-7xl font-light leading-[1.05]">
              Vetted vendors. <span className="italic text-gradient-gold">Every state.</span>
            </h1>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search beer crates, soft drinks, water, cocktail packs, spirits..."
              className="pl-11 h-14 text-base bg-card border-border"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              title="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant={searchType === "vendors" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("vendors")}
            >
              Vendors
            </Button>
            <Button
              variant={searchType === "products" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("products")}
            >
              Products
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex gap-8">
            {showFilters && searchType === "products" && (
              <div className="w-64 shrink-0">
                <SearchFilters onFiltersChange={setFilters} />
              </div>
            )}

            <div className="flex-1">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-56 rounded-lg border border-border bg-card animate-pulse" />
                  ))}
                </div>
              ) : searchType === "vendors" ? (
                filteredVendors.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((v) => (
                      <VendorCard key={v.id} v={v} />
                    ))}
                  </div>
                )
              ) : filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function VendorCard({ v }: { v: Vendor }) {
  return (
    <Link
      to="/vendor/$slug"
      params={{ slug: v.slug }}
      className="group relative p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-all duration-300 luxe-shadow flex flex-col gap-4"
    >
      {v.is_featured && (
        <div className="absolute -top-2 right-4 px-3 py-1 rounded-full bg-[image:var(--gradient-gold)] text-primary-foreground text-[10px] tracking-widest uppercase font-semibold">
          Featured
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-md border border-border bg-onyx flex items-center justify-center overflow-hidden shrink-0">
          {v.logo_url ? (
            <img src={v.logo_url} alt={v.business_name} className="h-full w-full object-cover" />
          ) : (
            <GlassWater className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-2xl truncate group-hover:text-primary transition-colors">{v.business_name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{v.rating_avg?.toFixed(1) ?? "New"}</span>
            {v.rating_count ? <span className="text-muted-foreground/60">({v.rating_count})</span> : null}
          </div>
        </div>
      </div>
      {v.description && <p className="text-sm text-muted-foreground line-clamp-2">{v.description}</p>}
      {v.coverage_states?.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{v.coverage_states.slice(0, 3).join(" · ")}</span>
        </div>
      )}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 max-w-md mx-auto space-y-4">
      <GlassWater className="h-12 w-12 text-primary mx-auto opacity-50" />
      <h2 className="font-display text-3xl">No results found</h2>
      <p className="text-muted-foreground">
        Try adjusting your search or filters to find what you're looking for.
      </p>
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group relative p-6 rounded-lg border border-border bg-card hover:border-primary/40 transition-all duration-300 luxe-shadow flex flex-col gap-4"
    >
      <div className="aspect-square rounded-md border border-border bg-onyx flex items-center justify-center overflow-hidden">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <GlassWater className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-xl truncate group-hover:text-primary transition-colors">{p.name}</h3>
        <p className="text-2xl text-gradient-gold font-display">₦{p.price.toLocaleString()}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {p.abv && <span className="px-2 py-1 rounded-full border border-border text-muted-foreground">{p.abv}% ABV</span>}
          {p.volume_ml && <span className="px-2 py-1 rounded-full border border-border text-muted-foreground">{p.volume_ml}ml</span>}
          <span className={`px-2 py-1 rounded-full border ${p.stock_status === "in_stock" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}`}>
            {p.stock_status.replace("_", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
