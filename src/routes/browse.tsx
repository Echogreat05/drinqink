import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MapPin, Star, GlassWater, Filter, Sparkles, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Vendors — DrinqInk" },
      {
        name: "description",
        content:
          "Discover vetted drinks vendors across Nigeria. Filter by state, category and rating.",
      },
    ],
  }),
  component: BrowsePage,
});

type Vendor = {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  coverage_states: string[];
  rating_avg: number | null;
  rating_count: number | null;
  is_featured: boolean;
};

type Product = {
  id: string;
  name: string;
  price: number;
  abv: number | null;
  volume_ml: number | null;
  stock_status: string;
  vendor_id: string;
  images: string[];
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
          .select(
            "id,business_name,slug,description,logo_url,coverage_states,rating_avg,rating_count,is_featured",
          )
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

  const filteredVendors = vendors.filter(
    (v) => !q || v.business_name.toLowerCase().includes(q.toLowerCase()),
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchesPrice = p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1];
    const matchesAbv = !p.abv || (p.abv >= filters.abvRange[0] && p.abv <= filters.abvRange[1]);
    const matchesStock = !filters.inStockOnly || p.stock_status === "in_stock";
    return matchesSearch && matchesPrice && matchesAbv && matchesStock;
  });

  return (
    <div className="min-h-screen font-sans">
      <SiteHeader />
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mb-8 sm:mb-10"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-semibold">
              Marketplace
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-light leading-[1.05]">
              Vetted vendors. <span className="italic text-gradient-gold">Every state.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search beer crates, soft drinks, water, cocktail packs, spirits..."
              className="pl-11 h-14 sm:h-16 text-base bg-card border-border/50 focus:border-primary/50 transition-colors"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-primary/10 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              title="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-2 sm:gap-3 mt-4"
          >
            <Button
              variant={searchType === "vendors" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("vendors")}
              className="group"
            >
              Vendors
              {searchType === "vendors" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </Button>
            <Button
              variant={searchType === "products" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("products")}
              className="group"
            >
              Products
              {searchType === "products" && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex gap-6 sm:gap-8">
            {showFilters && searchType === "products" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-64 shrink-0"
              >
                <SearchFilters onFiltersChange={setFilters} />
              </motion.div>
            )}

            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="h-56 rounded-xl border border-border/50 bg-card animate-pulse"
                    />
                  ))}
                </div>
              ) : searchType === "vendors" ? (
                filteredVendors.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredVendors.map((v, i) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                      >
                        <VendorCard v={v} />
                      </motion.div>
                    ))}
                  </div>
                )
              ) : filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <ProductCard p={p} />
                    </motion.div>
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
      className="group relative p-5 sm:p-6 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 luxe-shadow flex flex-col gap-4 overflow-hidden"
    >
      <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {v.is_featured && (
        <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-[image:var(--gradient-gold)] text-primary-foreground text-[9px] sm:text-[10px] tracking-[0.15em] uppercase font-semibold">
          Featured
        </div>
      )}
      <div className="relative z-10 flex items-start gap-3 sm:gap-4">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-md border border-border/50 bg-onyx flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
          {v.logo_url ? (
            <img src={v.logo_url} alt={v.business_name} className="h-full w-full object-cover" />
          ) : (
            <GlassWater className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg sm:text-2xl truncate group-hover:text-primary transition-colors">
            {v.business_name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{v.rating_avg?.toFixed(1) ?? "New"}</span>
            {v.rating_count ? (
              <span className="text-muted-foreground/60">({v.rating_count})</span>
            ) : null}
          </div>
        </div>
      </div>
      {v.description && (
        <p className="relative z-10 text-sm text-muted-foreground line-clamp-2">{v.description}</p>
      )}
      {v.coverage_states?.length > 0 && (
        <div className="relative z-10 flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
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
      className="group relative p-5 sm:p-6 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 luxe-shadow flex flex-col gap-4 overflow-hidden"
    >
      <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 aspect-square rounded-lg border border-border/50 bg-onyx flex items-center justify-center overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <GlassWater className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="relative z-10 space-y-2 sm:space-y-3">
        <h3 className="font-display text-lg sm:text-xl truncate group-hover:text-primary transition-colors">
          {p.name}
        </h3>
        <p className="text-xl sm:text-2xl text-gradient-gold font-display">
          ₦{p.price.toLocaleString()}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {p.abv && (
            <span className="px-2 py-1 rounded-full border border-border/50 text-muted-foreground">
              {p.abv}% ABV
            </span>
          )}
          {p.volume_ml && (
            <span className="px-2 py-1 rounded-full border border-border/50 text-muted-foreground">
              {p.volume_ml}ml
            </span>
          )}
          <span
            className={`px-2 py-1 rounded-full border ${
              p.stock_status === "in_stock"
                ? "border-primary/40 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {p.stock_status.replace("_", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
