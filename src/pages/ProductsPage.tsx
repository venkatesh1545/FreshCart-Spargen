
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products, categories } from '@/data/products';
import { Product } from '@/types/product';
import { ProductGrid } from '@/components/Product/ProductGrid';
import { ProductFilter, FilterOptions } from '@/components/Product/ProductFilter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [relatedTerms, setRelatedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Get initial search and category from URL query params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  // Initial filters
  const initialFilters: FilterOptions = {
    categories: initialCategory ? [initialCategory] : [],
    priceRange: [0, 100],
    minRating: 0,
    inStock: false,
    expressDelivery: false
  };

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    const timer = setTimeout(() => {
      applyFilters(initialFilters);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Update filters when URL changes
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category !== initialCategory) {
      setFilteredProducts(
        products.filter(product => 
          (!category || product.category === category) &&
          (!searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }
    
    if (search !== initialSearch) {
      setSearchQuery(search || '');
      setFilteredProducts(
        products.filter(product => 
          (!category || product.category === category) &&
          (!search || product.name.toLowerCase().includes(search.toLowerCase()))
        )
      );

      // If search query exists, generate related search terms
      if (search) {
        generateRelatedTerms(search);
      } else {
        setRelatedTerms([]);
      }
    }
  }, [searchParams]);

  // Generate related search terms based on current search query
  const generateRelatedTerms = (search: string) => {
    const searchLower = search.toLowerCase();
    
    // Find common words in products that match the search
    const matchingProducts = products.filter(product => 
      product.name.toLowerCase().includes(searchLower) || 
      product.category.toLowerCase().includes(searchLower)
    );
    
    // Extract keywords from matching products
    let keywords = new Set<string>();
    
    matchingProducts.forEach(product => {
      // Add category as related term
      keywords.add(product.category);
      
      // Extract words from product name
      product.name.split(' ').forEach(word => {
        if (word.length > 3 && word.toLowerCase() !== searchLower) {
          keywords.add(word);
        }
      });
    });
    
    // Convert set to array and limit to 5 related terms
    setRelatedTerms(Array.from(keywords).slice(0, 5));
  };

  const applyFilters = (filters: FilterOptions) => {
    setLoading(true);
    
    // Apply all filters
    const filtered = products.filter(product => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Rating filter
      if (product.rating < filters.minRating) {
        return false;
      }
      
      // In stock filter
      if (filters.inStock && product.stock <= 0) {
        return false;
      }
      
      // Express delivery filter
      if (filters.expressDelivery && !product.isExpress) {
        return false;
      }
      
      // Search query
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Update URL with filters
    const params = new URLSearchParams();
    if (filters.categories.length === 1) {
      params.set('category', filters.categories[0]);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    setSearchParams(params);
    
    setFilteredProducts(filtered);
    setTimeout(() => setLoading(false), 300);
    
    // Update related terms if we have a search query
    if (searchQuery) {
      generateRelatedTerms(searchQuery);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
    
    applyFilters(initialFilters);
  };

  const handleRelatedTermClick = (term: string) => {
    setSearchQuery(term);
    
    const params = new URLSearchParams(searchParams);
    params.set('search', term);
    setSearchParams(params);
    
    applyFilters({
      ...initialFilters,
      categories: term === initialCategory ? [term] : initialFilters.categories
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Shop Products</h1>
      
      {/* Mobile search */}
      <form onSubmit={handleSearch} className="mb-6 md:hidden">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-0 top-0 h-full"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <div className="w-full md:w-64 shrink-0">
          <ProductFilter 
            categories={categories}
            onFilterChange={applyFilters}
            initialFilters={initialFilters}
          />
        </div>
        
        {/* Products */}
        <div className="flex-1">
          {/* Desktop search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex mb-6">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>

          {/* Related search terms */}
          {relatedTerms.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Related searches:</p>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map((term, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRelatedTermClick(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results info */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredProducts.length} products
          </p>
          
          {/* Products grid */}
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            skeletonCount={8}
          />
        </div>
      </div>
    </div>
  );
}
