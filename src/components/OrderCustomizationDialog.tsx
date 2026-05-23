// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface OrderCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (customization: OrderCustomization) => void;
  productName: string;
}

export interface OrderCustomization {
  specialInstructions?: string;
  addIce: boolean;
  addMixer: boolean;
  chilled: boolean;
}

export function OrderCustomizationDialog({
  open,
  onOpenChange,
  onSave,
  productName,
}: OrderCustomizationDialogProps) {
  const [customization, setCustomization] = useState<OrderCustomization>({
    addIce: false,
    addMixer: false,
    chilled: false,
  });

  const handleSave = () => {
    onSave(customization);
    onOpenChange(false);
    toast.success("Customization saved");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Special Instructions</Label>
            <Textarea
              placeholder="Any special requests? (e.g., gift wrap, specific brand preference)"
              value={customization.specialInstructions || ""}
              onChange={(e) =>
                setCustomization({ ...customization, specialInstructions: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ice"
                checked={customization.addIce}
                onCheckedChange={(checked) =>
                  setCustomization({ ...customization, addIce: checked as boolean })
                }
              />
              <Label htmlFor="ice" className="cursor-pointer">
                Add Ice (+₦50)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mixer"
                checked={customization.addMixer}
                onCheckedChange={(checked) =>
                  setCustomization({ ...customization, addMixer: checked as boolean })
                }
              />
              <Label htmlFor="mixer" className="cursor-pointer">
                Add Mixer (+₦100)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="chilled"
                checked={customization.chilled}
                onCheckedChange={(checked) =>
                  setCustomization({ ...customization, chilled: checked as boolean })
                }
              />
              <Label htmlFor="chilled" className="cursor-pointer">
                Serve Chilled
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Customization</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
