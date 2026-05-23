// @ts-nocheck
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function VendorAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    const [vendorData, ordersData, productsData] = await Promise.all([
      supabase.from("vendors").select("id").eq("user_id", user.id).single(),
      supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("vendor_id", (await supabase.from("vendors").select("id").eq("user_id", user.id).single()).data?.id),
      supabase
        .from("products")
        .select("id")
        .eq("vendor_id", (await supabase.from("vendors").select("id").eq("user_id", user.id).single()).data?.id),
    ]);

    const orders = ordersData.data || [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = productsData.data?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalProducts,
      avgOrderValue,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
    });
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`₦${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={stats.revenueGrowth}
          trendUp
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          trend={stats.ordersGrowth}
          trendUp
        />
        <StatCard
          title="Products"
          value={stats.totalProducts.toString()}
          icon={Package}
        />
        <StatCard
          title="Avg Order Value"
          value={`₦${stats.avgOrderValue.toLocaleString()}`}
          icon={Users}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart visualization would be rendered here with Recharts or similar library
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product {i}</p>
                  <p className="text-sm text-muted-foreground">{100 - i * 10} orders</p>
                </div>
                <p className="font-medium">₦{(50000 - i * 5000).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: typeof DollarSign;
  trend?: number;
  trendUp?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2 text-sm">
            {trendUp ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={trendUp ? "text-green-600" : "text-red-600"}>
              {trend}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
