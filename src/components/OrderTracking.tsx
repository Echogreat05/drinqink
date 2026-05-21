import { useEffect, useState } from "react";
import { MapPin, Truck, Package, CheckCircle, Clock, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth-middleware";

interface OrderTrackingProps {
  orderId: string;
}

export function OrderTracking({ orderId }: OrderTrackingProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrackingData();
    const subscription = supabase
      .channel(`order_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new);
          loadTrackingData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [orderId]);

  const loadTrackingData = async () => {
    const [orderData, trackingData] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase
        .from("order_tracking")
        .select("*")
        .eq("order_id", orderId)
        .order("timestamp", { ascending: true }),
    ]);

    setOrder(orderData.data);
    setTracking(trackingData.data || []);
    setLoading(false);
  };

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "preparing", label: "Preparing", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.key === order?.status);

  if (loading) {
    return <div className="text-center py-8">Loading tracking information...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs mt-2 text-center">{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">{order?.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  {order?.estimated_delivery
                    ? `Est. delivery: ${new Date(order.estimated_delivery).toLocaleString()}`
                    : "Delivery time being calculated"}
                </span>
              </div>
            </div>

            {/* Driver Info */}
            {order?.status === "out_for_delivery" && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3">Driver Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Name:</span>
                    <span>John Doe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+234 800 123 4567</span>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Driver
                  </Button>
                </div>
              </div>
            )}

            {/* Tracking History */}
            <div>
              <h3 className="font-medium mb-3">Tracking History</h3>
              <div className="space-y-3">
                {tracking.map((track) => (
                  <div key={track.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-medium">{track.status}</p>
                      <p className="text-muted-foreground">
                        {new Date(track.timestamp).toLocaleString()}
                      </p>
                      {track.location && (
                        <p className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {track.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {tracking.length === 0 && (
                  <p className="text-muted-foreground">No tracking updates yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            Map integration would show live delivery tracking here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
