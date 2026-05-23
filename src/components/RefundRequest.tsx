// @ts-nocheck
import { useEffect, useState } from "react";
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function RefundRequest({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState("full");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefundRequests();
  }, [orderId]);

  const loadRefundRequests = async () => {
    const { data } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    setRefundRequests(data || []);
    setLoading(false);
  };

  const submitRefundRequest = async () => {
    if (!reason.trim() || !user) return;

    const { error } = await supabase.from("refund_requests").insert({
      order_id: orderId,
      customer_id: user.id,
      reason,
      refund_type: refundType,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to submit refund request");
    } else {
      setReason("");
      setRequestDialogOpen(false);
      loadRefundRequests();
      toast.success("Refund request submitted");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading refund requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display">Refund Requests</h2>
        {refundRequests.length === 0 && (
          <Button onClick={() => setRequestDialogOpen(true)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Request Refund
          </Button>
        )}
      </div>

      {refundRequests.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <RotateCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Refund Requests</h3>
            <p className="text-muted-foreground mb-4">
              If you're not satisfied with your order, you can request a refund
            </p>
            <Button onClick={() => setRequestDialogOpen(true)}>
              Request Refund
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refundRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {request.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                        {request.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {request.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline">{request.refund_type}</Badge>
                  </div>

                  <div>
                    <Label>Reason</Label>
                    <p className="text-sm mt-1">{request.reason}</p>
                  </div>

                  {request.admin_notes && (
                    <div className="bg-muted rounded p-3">
                      <Label className="text-xs">Admin Response</Label>
                      <p className="text-sm mt-1">{request.admin_notes}</p>
                    </div>
                  )}

                  {request.status === "approved" && request.refund_amount && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">
                        Refund of ₦{request.refund_amount.toLocaleString()} processed
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="refundType">Refund Type</Label>
              <Select value={refundType} onValueChange={setRefundType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Refund</SelectItem>
                  <SelectItem value="partial">Partial Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you're requesting a refund..."
                rows={4}
              />
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <p>
                Refund requests are reviewed within 2-3 business days. You'll receive a
                notification once a decision is made.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRefundRequest} disabled={!reason.trim()}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
