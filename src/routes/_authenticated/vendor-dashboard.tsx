// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, Edit, Trash2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorAnalytics } from "@/components/VendorAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vendor-dashboard")({
  component: VendorDashboard,
});

function VendorDashboard() {
  const { user } = useAuth();
  const [isVendor, setIsVendor] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics">("products");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    checkVendorStatus();
    loadVendorData();
  }, [user]);

  const checkVendorStatus = async () => {
    if (!user) return;
    const { data } = await supabase.from("vendors").select("id").eq("user_id", user.id).single();
    if (data) {
      setVendorId(data.id);
      setIsVendor(true);
    }
  };

  const loadVendorData = async () => {
    if (!vendorId) return;

    const [prods, ords] = await Promise.all([
      supabase.from("products").select("*").eq("vendor_id", vendorId),
      supabase.from("orders").select("*").eq("vendor_id", vendorId),
    ]);

    setProducts(prods.data || []);
    setOrders(ords.data || []);

    const revenue = await supabase
      .from("orders")
      .select("total_amount")
      .eq("vendor_id", vendorId)
      .eq("status", "completed");

    setStats({
      totalProducts: prods.data?.length || 0,
      totalOrders: ords.data?.length || 0,
      totalRevenue: revenue.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
      pendingOrders: ords.data?.filter((o) => o.status === "pending").length || 0,
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    loadVendorData();
    toast.success("Order status updated");
  };

  const deleteProduct = async (productId: string) => {
    await supabase.from("products").delete().eq("id", productId);
    loadVendorData();
    toast.success("Product deleted");
  };

  if (!isVendor) {
    return (
      <PageShell eyebrow="Access Denied" title="Vendor Only">
        <div className="text-center py-12">
          <p className="text-muted-foreground">You don't have a vendor account.</p>
          <Button asChild className="mt-4">
            <Link to="/vendor-onboarding">Become a Vendor</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Vendor Dashboard" title="Manage Your Business">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Good</div>
              <p className="text-xs text-muted-foreground">Based on orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
          >
            Products
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Your Products</CardTitle>
              <Button onClick={() => setProductDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>₦{Number(product.price).toLocaleString()}</TableCell>
                      <TableCell>{product.stock_status}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
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

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{order.customer_id}</TableCell>
                      <TableCell>₦{Number(order.total_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          aria-label="Order status"
                          title="Order status"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="completed">Completed</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <VendorAnalytics />}
      </div>

      {/* Add Product Dialog */}
      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        vendorId={vendorId}
        onSave={() => {
          loadVendorData();
          setProductDialogOpen(false);
        }}
      />
    </PageShell>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  vendorId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string | null;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    min_qty: "1",
    abv: "",
    volume_ml: "",
  });

  const handleSubmit = async () => {
    if (!vendorId) return;

    await supabase.from("products").insert({
      vendor_id: vendorId,
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      min_qty: Number(formData.min_qty),
      abv: formData.abv ? Number(formData.abv) : null,
      volume_ml: formData.volume_ml ? Number(formData.volume_ml) : null,
      stock_status: "in_stock",
      is_active: true,
    });

    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="min_qty">Min Quantity</Label>
              <Input
                id="min_qty"
                type="number"
                value={formData.min_qty}
                onChange={(e) => setFormData({ ...formData, min_qty: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="abv">ABV (%)</Label>
              <Input
                id="abv"
                type="number"
                value={formData.abv}
                onChange={(e) => setFormData({ ...formData, abv: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="volume_ml">Volume (ml)</Label>
              <Input
                id="volume_ml"
                type="number"
                value={formData.volume_ml}
                onChange={(e) => setFormData({ ...formData, volume_ml: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
