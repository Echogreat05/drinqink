// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Store, ShoppingBag, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVendors: 0,
    activeDeals: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingVendorsList, setPendingVendorsList] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
    loadStats();
    loadRecentOrders();
    loadPendingVendors();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(data || false);
  };

  const loadStats = async () => {
    const [users, vendors, orders, deals] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("vendors").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, total_amount", { count: "exact", head: true }),
      supabase.from("flash_deals").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

    const pending = await supabase
      .from("vendors")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    const revenue = await supabase.from("orders").select("total_amount");

    setStats({
      totalUsers: users.count || 0,
      totalVendors: vendors.count || 0,
      totalOrders: orders.count || 0,
      totalRevenue: revenue.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
      pendingVendors: pending.count || 0,
      activeDeals: deals.count || 0,
    });
  };

  const loadRecentOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customers(*)")
      .order("created_at", { ascending: false })
      .limit(10);
    setRecentOrders(data || []);
  };

  const loadPendingVendors = async () => {
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .eq("status", "pending")
      .limit(5);
    setPendingVendorsList(data || []);
  };

  const approveVendor = async (vendorId: string) => {
    await supabase.from("vendors").update({ status: "approved" }).eq("id", vendorId);
    loadPendingVendors();
    loadStats();
  };

  const rejectVendor = async (vendorId: string) => {
    await supabase.from("vendors").update({ status: "rejected" }).eq("id", vendorId);
    loadPendingVendors();
    loadStats();
  };

  if (!isAdmin) {
    return (
      <PageShell eyebrow="Access Denied" title="Admin Only">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Admin Dashboard" title="Platform Overview">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingVendors} pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDeals}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Vendors</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVendors}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Vendors */}
        {pendingVendorsList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Vendor Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendorsList.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.business_name}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveVendor(vendor.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectVendor(vendor.id)}>
                            Reject
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/vendor/${vendor.slug}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.customers?.email || "Unknown"}</TableCell>
                    <TableCell>₦{Number(order.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/admin/users">Manage Users</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/vendors">Manage Vendors</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/orders">Manage Orders</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/deals">Manage Flash Deals</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
