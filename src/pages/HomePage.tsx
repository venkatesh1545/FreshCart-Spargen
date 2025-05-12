
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/components/Product/ProductCard';
import { ProductCardSkeleton } from '@/components/Product/ProductCardSkeleton';
import { products, categories } from '@/data/products';
import { useIsMobile } from '@/hooks/use-mobile';

// Category images mapping with more specific images
const categoryImages = {
  'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=2070&auto=format&fit=crop',
  'Vegetables': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=2069&auto=format&fit=crop',
  'Dairy': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=2070&auto=format&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=2070&auto=format&fit=crop',
  'Bakery': 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=2070&auto=format&fit=crop',
  'Beverages': 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=2070&auto=format&fit=crop',
  'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=2070&auto=format&fit=crop',
  'Seafood': 'https://images.unsplash.com/photo-1611171711791-b34b3f85fa07?q=80&w=2070&auto=format&fit=crop'
};

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState(products.slice(0, 8));
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const heroImageUrl = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop";

  // Featured categories to display
  const featuredCategories = ['Fruits', 'Vegetables', 'Dairy', 'Snacks'];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative bg-gradient-to-r from-black/70 to-black/40 text-white">
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.65)',
            }}
          />
          <div className="container relative z-10 py-20 md:py-32 flex flex-col items-start">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-2xl animate-fade-in">
              Fresh Groceries Delivered to Your Doorstep
            </h1>
            <p className="text-lg md:text-xl max-w-xl mb-8 animate-slide-in">
              Shop fresh, organic produce, dairy, and more with convenient same-day delivery from FreshCart.
            </p>
            <Button size="lg" asChild className="animate-scale-in">
              <Link to="/products" className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Shop Categories</h2>
            <Button variant="link" asChild>
              <Link to="/categories" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCategories.map((category) => (
              <Link 
                key={category}
                to={`/products?category=${category}`}
                className="group relative overflow-hidden rounded-lg transition-all hover:shadow-lg"
              >
                <div className="aspect-video md:aspect-square relative">
                  {/* Background image - now using proper category images */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${categoryImages[category as keyof typeof categoryImages]})`,
                    }}
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex items-end p-4">
                    <h3 className="text-xl font-medium text-white">{category}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="container">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Trending Products</h2>
            <Button variant="link" asChild>
              <Link to="/products" className="flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isMobile ? (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {loading 
                  ? Array(4).fill(0).map((_, i) => (
                      <CarouselItem key={i} className="pl-2 md:pl-4 basis-full sm:basis-1/2">
                        <ProductCardSkeleton />
                      </CarouselItem>
                    ))
                  : trendingProducts.slice(0, 4).map((product) => (
                      <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2">
                        <ProductCard product={product} />
                      </CarouselItem>
                    ))
                }
              </CarouselContent>
              <div className="hidden sm:flex justify-end gap-2 mt-6">
                <CarouselPrevious />
                <CarouselNext />
              </div>
            </Carousel>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading
                ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                : trendingProducts.map((product) => <ProductCard key={product.id} product={product} />)
              }
            </div>
          )}
        </div>
      </section>

      {/* Featured Banner */}
      <section className="container">
        <div className="relative overflow-hidden rounded-lg bg-freshcart-900 text-white">
          <div className="absolute inset-0 z-0 opacity-20"
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1584473457491-79fce3949a5a)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
          />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
            <div className="text-center md:text-left">
              <span className="inline-block bg-freshcart-600 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
                Special Offer
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                20% Off Fresh Organic Vegetables
              </h3>
              <p className="text-white/80 mb-6 max-w-md">
                Shop our selection of organic, locally grown vegetables and save 20% this week.
              </p>
              <Button variant="secondary" asChild>
                <Link to="/products?category=Vegetables">Shop Now</Link>
              </Button>
            </div>
            
            <div className="w-40 h-40 md:w-64 md:h-64 rounded-full bg-freshcart-500/20 flex items-center justify-center p-4">
              <img 
                src="https://images.unsplash.com/photo-1574316071802-0d684efa7bf5" 
                alt="Organic vegetables" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-freshcart-100">
            <CardContent className="flex gap-4 items-center p-6">
              <div className="rounded-full bg-freshcart-50 p-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-freshcart-600">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">100% Organic</h3>
                <p className="text-muted-foreground">Certified organic products grown without synthetic pesticides or GMOs</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-freshcart-100">
            <CardContent className="flex gap-4 items-center p-6">
              <div className="rounded-full bg-freshcart-50 p-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-freshcart-600">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Free Delivery</h3>
                <p className="text-muted-foreground">Free delivery on all orders over ₹50, same-day delivery available</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-freshcart-100">
            <CardContent className="flex gap-4 items-center p-6">
              <div className="rounded-full bg-freshcart-50 p-3 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-freshcart-600">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Daily Deals</h3>
                <p className="text-muted-foreground">Special offers and discounts on fresh produce every day</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
