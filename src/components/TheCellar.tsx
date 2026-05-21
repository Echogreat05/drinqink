import { useEffect, useState } from "react";
import { Sparkles, Crown, Star, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export function TheCellar() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCellarProducts();
  }, []);

  const loadCellarProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, vendors(business_name)")
      .eq("is_premium", true)
      .eq("is_active", true);

    setProducts(data || []);
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.vendors?.business_name?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "whiskey" && product.category_id === "whiskey") ||
      (filter === "wine" && product.category_id === "wine") ||
      (filter === "cognac" && product.category_id === "cognac");
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading rare bottles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-display">The Cellar</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {products.length} Rare Bottles
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Premium Collection</h3>
              <p className="text-sm text-muted-foreground">
                Curated rare and aged bottles from the finest distilleries and vineyards
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rare bottles..."
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="whiskey">Whiskey</SelectItem>
            <SelectItem value="wine">Wine</SelectItem>
            <SelectItem value="cognac">Cognac</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <Crown className="h-16 w-16 text-amber-600/30" />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                <Badge className="bg-amber-600">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{product.vendors?.business_name}</p>
                {product.vintage && (
                  <Badge variant="outline" className="text-xs">
                    Vintage: {product.vintage}
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gradient-gold">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                  <Button size="sm">Add to Cart</Button>
                </div>
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No rare bottles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
