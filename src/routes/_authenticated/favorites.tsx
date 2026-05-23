// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useFavorites } from "@/hooks/use-favorites";
import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Store } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, isLoading } = useFavorites();

  const vendorFavorites = favorites?.filter((f) => f.vendor_id) || [];
  const productFavorites = favorites?.filter((f) => f.product_id) || [];

  return (
    <PageShell
      eyebrow="My Favorites"
      title="Saved Items"
      subtitle="Your favorite vendors and products, all in one place."
    >
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center py-12">Loading favorites...</div>
        ) : favorites?.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              Start saving your favorite vendors and products
            </p>
            <Link to="/browse">
              <Button>Browse Vendors</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {vendorFavorites.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Store className="h-6 w-6" />
                  Favorite Vendors
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendorFavorites.map((fav) => (
                    <Card key={fav.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {fav.vendors?.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {fav.vendors?.description}
                        </p>
                        <Link to={`/vendor/${fav.vendors?.slug}`}>
                          <Button variant="outline" className="w-full">
                            Visit Vendor
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {productFavorites.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  Favorite Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productFavorites.map((fav) => (
                    <Card key={fav.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {fav.products?.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          ₦{Number(fav.products?.price).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {fav.products?.description}
                        </p>
                        <Link to={`/product/${fav.products?.id}`}>
                          <Button variant="outline" className="w-full">
                            View Product
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
