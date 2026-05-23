// @ts-nocheck
import { useState } from "react";
import { MapPin, Check, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AddressValidation() {
  const [address, setAddress] = useState("");
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean;
    formattedAddress?: string;
    coordinates?: { lat: number; lng: number };
    suggestions?: string[];
  } | null>(null);

  const validateAddress = async () => {
    setValidating(true);
    // Simulate geocoding API call
    setTimeout(() => {
      setResult({
        isValid: true,
        formattedAddress: "123 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria",
        coordinates: { lat: 6.4281, lng: 3.4219 },
        suggestions: [
          "123 Adetokunbo Ademola Street, Victoria Island",
          "125 Adetokunbo Ademola Street, Victoria Island",
          "127 Adetokunbo Ademola Street, Victoria Island",
        ],
      });
      setValidating(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address">Delivery Address</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
          />
          <Button onClick={validateAddress} disabled={!address.trim() || validating}>
            {validating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {result.isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Address validated successfully</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Address not found</span>
                </div>
              )}

              {result.formattedAddress && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Formatted Address</p>
                  <p className="font-medium">{result.formattedAddress}</p>
                </div>
              )}

              {result.coordinates && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                  <Badge variant="secondary">
                    {result.coordinates.lat.toFixed(4)}, {result.coordinates.lng.toFixed(4)}
                  </Badge>
                </div>
              )}

              {result.suggestions && result.suggestions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Did you mean?</p>
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setAddress(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
