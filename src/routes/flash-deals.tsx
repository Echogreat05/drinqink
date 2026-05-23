// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Zap } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/FavoriteButton";

export const Route = createFileRoute("/flash-deals")({
  head: () => ({
    meta: [
      { title: "Flash Deals — SipCellar" },
      { name: "description", content: "Limited-time vendor offers and time-boxed discounts on premium drinks." },
    ],
  }),
  component: FlashDealsPage,
});

type FlashDeal = {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  status: string;
  products: {
    id: string;
    name: string;
    price: number;
    images: string[];
    vendor_id: string;
  }[];
};

function FlashDealsPage() {
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const add = useCart((s) => s.add);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("flash_deals")
        .select("*, products(*)")
        .eq("status", "active")
        .gte("starts_at", new Date().toISOString())
        .lte("ends_at", new Date().toISOString());
      setDeals((data || []) as any);
      setLoading(false);
    })();
  }, []);

  const addToCart = (product: FlashDeal["products"][0], originalPrice: number, discountPercent: number) => {
    const discountedPrice = originalPrice * (1 - discountPercent / 100);
    add({
      product_id: product.id,
      vendor_id: product.vendor_id,
      vendor_name: "Vendor",
      name: product.name,
      price: discountedPrice,
      image: product.images?.[0] ?? null,
      qty: 1,
      min_qty: 1,
    });
    toast.success(`Added ${product.name} at ${discountPercent}% off`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-6 lg:px-10">
            <div className="h-96 rounded-lg bg-card animate-pulse" />
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs tracking-widest uppercase text-primary">Limited time</span>
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-light leading-[1.05]">
              Flash <span className="italic text-gradient-gold">deals</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Time-boxed discounts from approved vendors. When the clock runs out, the price returns.
            </p>
          </div>

          {deals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-primary/30 p-16 text-center bg-card/40">
              <Clock className="h-10 w-10 text-primary mx-auto mb-4 opacity-50" />
              <h2 className="font-display text-3xl mb-2">No live deals right now</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Flash deals appear here when vendors are running promotions. Check back, or browse the marketplace.
              </p>
              <Button asChild variant="hero">
                <Link to="/browse">Browse vendors</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((deal) => (
                <Card key={deal.id} className="overflow-hidden border-primary/30">
                  <CardHeader className="bg-primary/5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{deal.title}</CardTitle>
                      <Badge className="bg-primary text-primary-foreground">
                        {deal.discount_percentage}% OFF
                      </Badge>
                    </div>
                    {deal.description && <p className="text-sm text-muted-foreground mt-2">{deal.description}</p>}
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {deal.products.map((product) => (
                        <div key={product.id} className="flex gap-3 items-center p-3 rounded-lg bg-card border">
                          <div className="h-16 w-16 rounded bg-onyx flex items-center justify-center overflow-hidden shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-4 w-4 bg-primary/20 rounded" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground line-through">
                                ₦{product.price.toLocaleString()}
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                ₦{(product.price * (1 - deal.discount_percentage / 100)).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <FavoriteButton type="product" itemId={product.id} size="icon" />
                            <Button
                              size="sm"
                              onClick={() => addToCart(product, product.price, deal.discount_percentage)}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
