import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-middleware";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("*, customers(display_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      customer_id: user.id,
      rating,
      comment,
    });

    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted successfully");
      setDialogOpen(false);
      setComment("");
      setRating(5);
      loadReviews();
    }
  };

  const helpfulReview = async (reviewId: string) => {
    if (!user) {
      toast.error("Please sign in to mark reviews as helpful");
      return;
    }

    await supabase.from("review_helpful").insert({
      review_id: reviewId,
      customer_id: user.id,
    });

    toast.success("Marked as helpful");
    loadReviews();
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
            </span>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {review.customers?.display_name || "Anonymous"}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => helpfulReview(review.id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                    title={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
