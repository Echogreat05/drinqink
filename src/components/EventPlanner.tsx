// @ts-nocheck
import { useState } from "react";
import { Sparkles, Calendar, Users, Wine, Clock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function EventPlanner() {
  const [formData, setFormData] = useState({
    eventType: "",
    guestCount: "",
    budget: "",
    date: "",
    preferences: "",
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const generateSuggestions = async () => {
    setLoading(true);
    // Simulate AI suggestions
    setTimeout(() => {
      setSuggestions([
        {
          category: "Whiskey Selection",
          items: ["Jameson", "Chivas Regal", "Jack Daniels"],
          quantity: Math.ceil(Number(formData.guestCount) / 10),
        },
        {
          category: "Wine Selection",
          items: ["Cabernet Sauvignon", "Chardonnay", "Prosecco"],
          quantity: Math.ceil(Number(formData.guestCount) / 8),
        },
        {
          category: "Mixers",
          items: ["Soda", "Tonic Water", "Orange Juice"],
          quantity: Math.ceil(Number(formData.guestCount) / 5),
        },
      ]);
      setLoading(false);
    }, 1500);
  };

  const handleSubmit = () => {
    toast.success("Event plan saved! You can now add these to your cart.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Event Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={formData.eventType} onValueChange={(v) => setFormData({ ...formData, eventType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="birthday">Birthday Party</SelectItem>
                  <SelectItem value="housewarming">Housewarming</SelectItem>
                  <SelectItem value="holiday">Holiday Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestCount">Number of Guests</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget (₦)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="100000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Event Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="preferences">Preferences (optional)</Label>
              <Textarea
                id="preferences"
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                placeholder="e.g., Prefer local brands, no whiskey, lots of wine..."
                rows={3}
              />
            </div>
            <Button onClick={generateSuggestions} disabled={loading} className="w-full">
              {loading ? "Generating suggestions..." : "Generate AI Suggestions"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wine className="h-5 w-5" />
              Suggested Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{suggestion.category}</h3>
                    <Badge variant="secondary">{suggestion.quantity} units</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.items.map((item: string, i: number) => (
                      <span key={i} className="text-sm bg-primary/10 px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <Button onClick={handleSubmit} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "Confirm guest count and budget",
              "Select beverages based on AI suggestions",
              "Order at least 1 week before event",
              "Arrange for delivery or pickup",
              "Have ice and glassware ready",
              "Consider non-alcoholic options",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded border border-primary/30" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
