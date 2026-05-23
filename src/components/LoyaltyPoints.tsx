// @ts-nocheck
import { useEffect, useState } from "react";
import { Gift, TrendingUp, History, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function LoyaltyPoints() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState<string>("bronze");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoyaltyData();
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user) return;

    const [pointsData, txData, rewardsData] = await Promise.all([
      supabase.from("customers").select("loyalty_points, loyalty_tier").eq("id", user.id).single(),
      supabase
        .from("loyalty_transactions")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("loyalty_rewards").select("*").eq("is_active", true),
    ]);

    if (pointsData.data) {
      setPoints(pointsData.data.loyalty_points || 0);
      setTier(pointsData.data.loyalty_tier || "bronze");
    }
    setTransactions(txData.data || []);
    setRewards(rewardsData.data || []);
    setLoading(false);
  };

  const redeemReward = async (rewardId: string, pointsCost: number) => {
    if (points < pointsCost) {
      toast.error("Not enough points to redeem this reward");
      return;
    }

    const { error } = await supabase.from("loyalty_redemptions").insert({
      customer_id: user?.id,
      reward_id: rewardId,
      points_cost: pointsCost,
    });

    if (error) {
      toast.error("Failed to redeem reward");
    } else {
      toast.success("Reward redeemed successfully!");
      loadLoyaltyData();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading loyalty data...</div>;
  }

  const tierColors: Record<string, string> = {
    bronze: "bg-amber-600",
    silver: "bg-gray-400",
    gold: "bg-yellow-500",
    platinum: "bg-purple-500",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Loyalty Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gradient-gold">{points.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <Badge className={`${tierColors[tier]} text-white`} variant="secondary">
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{reward.name}</h4>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                  <p className="text-sm font-medium text-primary mt-1">{reward.points_cost} points</p>
                </div>
                <Button
                  onClick={() => redeemReward(reward.id, reward.points_cost)}
                  disabled={points < reward.points_cost}
                >
                  Redeem
                </Button>
              </div>
            ))}
            {rewards.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No rewards available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`font-medium ${
                    tx.points_change > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.points_change > 0 ? "+" : ""}
                  {tx.points_change}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
