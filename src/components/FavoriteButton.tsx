import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";

interface FavoriteButtonProps {
  type: "vendor" | "product";
  itemId: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({ type, itemId, size = "icon" }: FavoriteButtonProps) {
  const { toggleFavorite, isFavorite, isLoading } = useFavorites();
  const favorited = isFavorite(type, itemId);

  return (
    <Button
      size={size}
      variant="ghost"
      onClick={() => toggleFavorite.mutate({ type, itemId })}
      disabled={isLoading}
      className={favorited ? "text-red-500 hover:text-red-600" : ""}
    >
      <Heart className={favorited ? "fill-current" : ""} size={size === "icon" ? 20 : 16} />
    </Button>
  );
}
