import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-middleware";
import { toast } from "sonner";

export function useFavorites() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*, vendors(*), products(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({
      type,
      itemId,
    }: {
      type: "vendor" | "product";
      itemId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const column = type === "vendor" ? "vendor_id" : "product_id";
      const { data: existing } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq(column, itemId)
        .single();

      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        return { action: "removed" };
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          [column]: itemId,
        });
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(
        result.action === "added" ? "Added to favorites" : "Removed from favorites"
      );
    },
    onError: () => {
      toast.error("Failed to update favorites");
    },
  });

  const isFavorite = (type: "vendor" | "product", itemId: string) => {
    if (!favorites) return false;
    const column = type === "vendor" ? "vendor_id" : "product_id";
    return favorites.some((fav) => fav[column] === itemId);
  };

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
}
