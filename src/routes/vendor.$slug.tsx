import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, MapPin, Wine, Clock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FavoriteButton } from "@/components/FavoriteButton";

export const Route = createFileRoute("/vendor/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — SipCellar` },
      { name: "description", content: `Order from ${params.slug} on SipCellar.` },
    ],
  }),
  component: VendorPage,
});

type Vendor = {
  id: string; business_name: string; description: string | null; logo_url: string | null;
  banner_url: string | null; coverage_states: string[]; min_order: number;
  rating_avg: number | null; rating_count: number | null; response_time_minutes: number | null;
  badges: string[];
};
type Product = { id: string; name: string; price: number; images: string[]; description: string | null };

function VendorPage() {
  const { slug } = Route.useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: v } = await supabase
        .from("vendors")
        .select("id,business_name,description,logo_url,banner_url,coverage_states,min_order,rating_avg,rating_count,response_time_minutes,badges")
        .eq("slug", slug)
        .eq("status", "approved")
        .maybeSingle();
      setVendor(v);
      if (v) {
        const { data: prods } = await supabase
          .from("products")
          .select("id,name,price,images,description")
          .eq("vendor_id", v.id)
          .eq("is_active", true);
        setProducts(prods ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <ShellLoading />;
  if (!vendor) return <NotFound />;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="pt-24 relative">
        <div className="h-72 lg:h-96 relative overflow-hidden border-b border-border">
          {vendor.banner_url ? (
            <img src={vendor.banner_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[image:var(--gradient-radial-gold)] opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-10 -mt-24 relative">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
            <div className="h-32 w-32 rounded-lg border-2 border-primary bg-card flex items-center justify-center overflow-hidden shrink-0 luxe-shadow">
              {vendor.logo_url ? <img src={vendor.logo_url} alt={vendor.business_name} className="h-full w-full object-cover" /> : <Wine className="h-12 w-12 text-primary" />}
            </div>
            <div className="flex-1 space-y-2 pb-2">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {vendor.badges?.map((b) => (
                    <span key={b} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] uppercase tracking-widest">{b}</span>
                  ))}
                </div>
                <FavoriteButton type="vendor" itemId={vendor.id} />
              </div>
              <h1 className="font-display text-4xl lg:text-6xl font-light">{vendor.business_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" /> {vendor.rating_avg?.toFixed(1) ?? "New"} {vendor.rating_count ? `(${vendor.rating_count})` : ""}</span>
                {vendor.response_time_minutes && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{vendor.response_time_minutes}m response</span>}
                {vendor.coverage_states?.length > 0 && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {vendor.coverage_states.slice(0, 3).join(", ")}</span>}
              </div>
            </div>
          </div>

          {vendor.description && <p className="mt-8 text-lg text-muted-foreground max-w-3xl leading-relaxed">{vendor.description}</p>}
          <p className="mt-2 text-sm text-primary">Minimum order: ₦{vendor.min_order.toLocaleString()}</p>
        </div>
      </section>

      <section className="pt-16 pb-24">
        <div className="container mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl mb-8">Catalogue</h2>
          {products.length === 0 ? (
            <p className="text-muted-foreground">This vendor hasn't added products yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all">
                  <div className="aspect-square rounded-md bg-onyx flex items-center justify-center overflow-hidden mb-3">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" /> : <Wine className="h-10 w-10 text-primary" />}
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

function ShellLoading() {
  return (
    <div className="min-h-screen"><SiteHeader />
      <div className="pt-40 container mx-auto px-6"><div className="h-96 rounded-lg bg-card animate-pulse" /></div>
      <SiteFooter />
    </div>
  );
}
function NotFound() {
  return (
    <div className="min-h-screen"><SiteHeader />
      <div className="pt-40 container mx-auto px-6 text-center">
        <h1 className="font-display text-5xl mb-4">Vendor not found</h1>
        <p className="text-muted-foreground mb-6">This vendor may no longer be available.</p>
        <Button asChild variant="hero"><Link to="/browse">Browse vendors</Link></Button>
      </div>
      <SiteFooter />
    </div>
  );
}
