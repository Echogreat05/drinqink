// @ts-nocheck
import { useState } from "react";
import { CreditCard, Users, Plus, Trash2, Divide } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SplitOption {
  id: string;
  label: string;
  description: string;
}

export function PaymentSplitting({ totalAmount }: { totalAmount: number }) {
  const [splitType, setSplitType] = useState<"equal" | "custom" | "percentage">("equal");
  const [participants, setParticipants] = useState([
    { id: "1", name: "You", amount: totalAmount },
  ]);
  const [newParticipantName, setNewParticipantName] = useState("");

  const splitOptions: SplitOption[] = [
    { id: "equal", label: "Split Equally", description: "Divide total equally among all" },
    { id: "custom", label: "Custom Amounts", description: "Set specific amounts for each person" },
    { id: "percentage", label: "Percentage Split", description: "Split by percentage" },
  ];

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: newParticipantName, amount: 0 },
    ]);
    setNewParticipantName("");
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipantAmount = (id: string, amount: number) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, amount } : p))
    );
  };

  const splitEqually = () => {
    const equalAmount = totalAmount / participants.length;
    setParticipants(participants.map((p) => ({ ...p, amount: equalAmount })));
  };

  const splitByPercentage = () => {
    const percentagePerPerson = 100 / participants.length;
    setParticipants(
      participants.map((p) => ({
        ...p,
        amount: (totalAmount * percentagePerPerson) / 100,
      }))
    );
  };

  const totalSplit = participants.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAmount - totalSplit;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Divide className="h-5 w-5" />
            Split Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RadioGroup value={splitType} onValueChange={(v: any) => setSplitType(v)}>
              {splitOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="grid gap-1.5">
                    <Label htmlFor={option.id} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-2">
              <Input
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                placeholder="Add person name"
              />
              <Button onClick={addParticipant} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {splitType === "equal" && (
              <Button onClick={splitEqually} variant="outline" className="w-full">
                Split ₦{totalAmount.toLocaleString()} equally ({participants.length} people)
              </Button>
            )}

            {splitType === "percentage" && (
              <Button onClick={splitByPercentage} variant="outline" className="w-full">
                Split by percentage ({participants.length} people)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participants ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{participant.name}</p>
                  {splitType === "percentage" && (
                    <Badge variant="secondary" className="mt-1">
                      {((participant.amount / totalAmount) * 100).toFixed(1)}%
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₦
                    </span>
                    <Input
                      type="number"
                      value={participant.amount}
                      onChange={(e) =>
                        updateParticipantAmount(participant.id, Number(e.target.value))
                      }
                      className="pl-8 w-32"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeParticipant(participant.id)}
                    disabled={participants.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total split</span>
              <span>₦{totalSplit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className={remaining >= 0 ? "text-green-600" : "text-red-600"}>
                ₦{remaining.toLocaleString()}
              </span>
            </div>
            <Button
              className="w-full"
              disabled={Math.abs(remaining) > 1}
              onClick={() => alert("Payment split confirmed!")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed with Split Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
