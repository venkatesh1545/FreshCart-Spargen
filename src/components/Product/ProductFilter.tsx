import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ProductFilterProps {
  categories: string[];
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  minRating: number;
  inStock: boolean;
  expressDelivery: boolean;
}

const defaultFilters: FilterOptions = {
  categories: [],
  priceRange: [0, 100],
  minRating: 0,
  inStock: false,
  expressDelivery: false,
};

export function ProductFilter({ 
  categories, 
  onFilterChange, 
  initialFilters = defaultFilters 
}: ProductFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    
    const updatedFilters = { ...filters, categories: updatedCategories };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handlePriceChange = (value: number[]) => {
    // Ensure we always have exactly two values by creating a proper tuple
    const priceRange: [number, number] = [
      value[0] ?? filters.priceRange[0], 
      value[1] ?? filters.priceRange[1]
    ];
    
    const updatedFilters = { ...filters, priceRange };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleRatingChange = (rating: number) => {
    const updatedFilters = { ...filters, minRating: rating };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleCheckboxChange = (key: 'inStock' | 'expressDelivery', checked: boolean) => {
    const updatedFilters = { ...filters, [key]: checked };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
          Reset all
        </Button>
      </div>
      <Separator />

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox 
                id={`category-${category}`} 
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked === true)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            defaultValue={filters.priceRange}
            min={0}
            max={100}
            step={1}
            onValueChange={handlePriceChange}
          />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>
      <Separator />

      {/* Ratings */}
      <div>
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox 
                id={`rating-${rating}`} 
                checked={filters.minRating === rating}
                onCheckedChange={(checked) => {
                  if (checked) handleRatingChange(rating);
                  else handleRatingChange(0);
                }}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                {Array(rating).fill(0).map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    stroke="currentColor"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-freshcart-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="ml-1">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Separator />

      {/* Other Filters */}
      <div>
        <h4 className="font-medium mb-3">Other Filters</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="in-stock" 
              checked={filters.inStock}
              onCheckedChange={(checked) => handleCheckboxChange('inStock', checked === true)}
            />
            <Label htmlFor="in-stock" className="text-sm">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="express-delivery" 
              checked={filters.expressDelivery}
              onCheckedChange={(checked) => handleCheckboxChange('expressDelivery', checked === true)}
            />
            <Label htmlFor="express-delivery" className="text-sm">
              Express Delivery
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden md:block sticky top-20 w-full max-w-[250px] h-fit">
        <FilterContent />
      </div>

      {/* Mobile Filter */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <Button className="w-full" onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
