import { useEffect, useState } from "react";
import { Users, Clock, Share2, Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function GroupOrders() {
  const { user } = useAuth();
  const [groupOrders, setGroupOrders] = useState<any[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupOrders();
  }, [user]);

  const loadGroupOrders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("group_orders")
      .select("*, group_order_participants(profiles(display_name))")
      .or(`created_by.eq.${user.id},group_order_participants.user_id.eq.${user.id}`);

    setGroupOrders(data || []);
    setLoading(false);
  };

  const createGroupOrder = async () => {
    if (!newGroupName.trim() || !user) return;

    const { error } = await supabase.from("group_orders").insert({
      name: newGroupName,
      created_by: user.id,
      status: "open",
      target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      toast.error("Failed to create group order");
    } else {
      setNewGroupName("");
      setCreateDialogOpen(false);
      loadGroupOrders();
      toast.success("Group order created");
    }
  };

  const joinGroupOrder = async (groupId: string) => {
    const { error } = await supabase.from("group_order_participants").insert({
      group_order_id: groupId,
      user_id: user?.id,
    });

    if (error) {
      toast.error("Failed to join group order");
    } else {
      loadGroupOrders();
      toast.success("Joined group order");
    }
  };

  const shareGroupOrder = async (groupId: string) => {
    const link = `${window.location.origin}/group-order/${groupId}`;
    if (navigator.share) {
      await navigator.share({
        title: "Join my group order on SipCellar",
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading group orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display">Group Orders</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group Order
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {groupOrders.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{group.name}</CardTitle>
                <Badge variant={group.status === "open" ? "default" : "secondary"}>
                  {group.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group.group_order_participants?.length || 0} participants</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {group.target_date
                      ? new Date(group.target_date).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareGroupOrder(group.id)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {group.created_by !== user?.id &&
                    !group.group_order_participants?.some((p: any) => p.user_id === user?.id) && (
                      <Button size="sm" onClick={() => joinGroupOrder(group.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Office Party Drinks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createGroupOrder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
