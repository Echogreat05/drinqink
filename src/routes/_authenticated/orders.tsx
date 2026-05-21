import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "My Orders — SipCellar" }] }),
  component: OrdersPage,
});

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("id,order_number,status,total_amount,created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as Order[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-5xl">
          <p className="text-xs tracking-widest uppercase text-primary mb-3">Your activity</p>
          <h1 className="font-display text-5xl lg:text-6xl font-light mb-12">My orders</h1>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-card border border-border animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 border border-border rounded-lg bg-card">
              <Package className="h-10 w-10 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">No orders yet.</p>
              <Link to="/browse" className="text-primary underline underline-offset-4">Browse the marketplace →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="flex items-center justify-between p-5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <div>
                    <p className="font-display text-lg">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · {o.status.replace(/_/g, " ")}</p>
                  </div>
                  <p className="text-primary font-semibold">₦{Number(o.total_amount).toLocaleString()}</p>
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
