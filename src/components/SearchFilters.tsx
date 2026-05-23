// @ts-nocheck
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  priceRange: [number, number];
  abvRange: [number, number];
  inStockOnly: boolean;
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [abvRange, setAbvRange] = useState<[number, number]>([0, 60]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const applyFilters = () => {
    onFiltersChange({
      priceRange,
      abvRange,
      inStockOnly,
    });
  };

  const resetFilters = () => {
    setPriceRange([0, 50000]);
    setAbvRange([0, 60]);
    setInStockOnly(false);
    onFiltersChange({
      priceRange: [0, 50000],
      abvRange: [0, 60],
      inStockOnly: false,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Price Range (₦)</Label>
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={50000}
            step={500}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₦{priceRange[0].toLocaleString()}</span>
            <span>₦{priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>ABV Range (%)</Label>
          <Slider
            value={abvRange}
            onValueChange={(value) => setAbvRange(value as [number, number])}
            max={60}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{abvRange[0]}%</span>
            <span>{abvRange[1]}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="inStock"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded border-gray-300"
            aria-label="In stock only"
            title="In stock only"
          />
          <Label htmlFor="inStock" className="text-sm cursor-pointer">
            In stock only
          </Label>
        </div>

        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
