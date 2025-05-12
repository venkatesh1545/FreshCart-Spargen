import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Heart, Minus, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ProductGallery } from '@/components/Product/ProductGallery';
import { ProductGrid } from '@/components/Product/ProductGrid';
import { Product } from '@/types/product';
import { products, getProductImages, getRelatedProducts } from '@/data/products';
import { useCart } from '@/providers/CartProvider';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (!id) {
        navigate('/products');
        return;
      }
      
      const foundProduct = products.find(p => p.id === id);
      if (!foundProduct) {
        navigate('/products');
        return;
      }
      
      setProduct(foundProduct);
      setImages(getProductImages(foundProduct.id));
      setRelatedProducts(getRelatedProducts(foundProduct.id));
      setLoading(false);
    }, 800);
  }, [id, navigate]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    setTimeout(() => {
      addToCart(product, quantity);
      setAddingToCart(false);
      
      toast({
        title: "Added to cart",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      });
    }, 300);
  };
  
  const handleBuyNow = () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    setTimeout(() => {
      addToCart(product, quantity);
      setAddingToCart(false);
      navigate('/checkout');
    }, 300);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    addToWishlist(product);
  };

  if (loading || !product) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-freshcart-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/products" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Product Images */}
          <div>
            <ProductGallery images={images} productName={product.name} />
          </div>

          {/* Right side - Product Info */}
          <div className="flex flex-col gap-4">
            {/* Category */}
            <Link 
              to={`/products?category=${product.category}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {product.category}
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isExpress && (
                <Badge variant="secondary" className="bg-freshcart-500 hover:bg-freshcart-600 text-white">
                  Express Delivery
                </Badge>
              )}
              {product.isNewlyAdded && (
                <Badge variant="outline" className="border-freshcart-500 text-freshcart-700">
                  New Arrival
                </Badge>
              )}
              {product.badges?.map((badge, index) => (
                <Badge key={index} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(product.rating) ? "fill-freshcart-500 text-freshcart-500" : "text-muted-foreground"
                  )}
                />
              ))}
              <span className="ml-2 text-sm">
                {product.rating.toFixed(1)} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-2">
              <span className="text-3xl font-bold flex items-center">
                <span className="mr-1">₹</span>
                {product.price.toFixed(2)}
              </span>
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground mt-2">
              {product.description.split('.')[0]}.
            </p>

            {/* Stock Status */}
            <div className="mt-2">
              {product.stock > 0 ? (
                <p className="flex items-center gap-1 text-freshcart-600">
                  <Check className="h-4 w-4" />
                  In Stock ({product.stock} available)
                </p>
              ) : (
                <p className="text-destructive">Out of Stock</p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Add to Cart Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-none"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    className="h-10 w-10 rounded-none"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  className={cn(
                    "flex-1 flex items-center gap-2 transition-all ripple-effect",
                    addingToCart && "animate-cart-bounce"
                  )}
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Add to Cart
                </Button>

                {/* Wishlist Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-12 w-12",
                    isInWishlist(product.id) && "text-red-500 border-red-500"
                  )}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={cn(
                    "h-5 w-5",
                    isInWishlist(product.id) && "fill-red-500"
                  )} />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
              </div>
              
              {/* Buy Now Button */}
              <Button 
                variant="secondary"
                size="lg"
                className="bg-freshcart-600 hover:bg-freshcart-700 text-white"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                Buy Now
              </Button>
            </div>

            {/* Product Features */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-freshcart-50 p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-freshcart-600">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Premium Quality</p>
                  <p className="text-xs text-muted-foreground">Verified source & quality</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-freshcart-50 p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-freshcart-600">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Secure Payments</p>
                  <p className="text-xs text-muted-foreground">100% protected payments</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-freshcart-50 p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-freshcart-600">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Customer Love</p>
                  <p className="text-xs text-muted-foreground">Rated {product.rating.toFixed(1)} by our customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Additional Info */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full grid grid-cols-3 max-w-md">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            {/* Description Tab */}
            <TabsContent value="description" className="mt-4">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                
                {product.ingredients && (
                  <Accordion type="single" collapsible className="mt-8">
                    <AccordionItem value="ingredients">
                      <AccordionTrigger>Ingredients</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1">
                          {product.ingredients.map((ingredient, index) => (
                            <li key={index} className="text-muted-foreground">
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </TabsContent>
            
            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="mt-4">
              {product.nutritionInfo ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted p-4">
                    <h3 className="font-semibold text-lg">Nutrition Facts</h3>
                    <p className="text-sm text-muted-foreground">Per serving</p>
                  </div>
                  
                  <div className="divide-y">
                    <div className="grid grid-cols-2 p-4">
                      <span>Calories</span>
                      <span className="font-medium text-right">{product.nutritionInfo.calories}</span>
                    </div>
                    <div className="grid grid-cols-2 p-4">
                      <span>Protein</span>
                      <span className="font-medium text-right">{product.nutritionInfo.protein}g</span>
                    </div>
                    <div className="grid grid-cols-2 p-4">
                      <span>Carbohydrates</span>
                      <span className="font-medium text-right">{product.nutritionInfo.carbs}g</span>
                    </div>
                    <div className="grid grid-cols-2 p-4">
                      <span>Fat</span>
                      <span className="font-medium text-right">{product.nutritionInfo.fat}g</span>
                    </div>
                    <div className="grid grid-cols-2 p-4">
                      <span>Fiber</span>
                      <span className="font-medium text-right">{product.nutritionInfo.fiber}g</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Nutrition information is not available for this product.</p>
              )}
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-4">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold">{product.rating.toFixed(1)}</span>
                    <div className="flex mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(product.rating) ? "fill-freshcart-500 text-freshcart-500" : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">
                      {product.reviews} reviews
                    </span>
                  </div>
                  
                  <Separator orientation="vertical" className="h-16" />
                  
                  <div className="flex-1">
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        // Mock distribution
                        const percent = rating === 5 ? 65 :
                                      rating === 4 ? 20 :
                                      rating === 3 ? 10 :
                                      rating === 2 ? 3 : 2;
                        
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-4">{rating}</span>
                            <Star className="h-3 w-3 fill-freshcart-500 text-freshcart-500" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-freshcart-500 rounded-full"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-muted-foreground w-8">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Sample Reviews */}
                <div className="space-y-8">
                  <h3 className="font-semibold text-lg">Customer Feedback</h3>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="reviews">
                      <AccordionTrigger>Show customer reviews</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6">
                          <div className="border-b pb-6">
                            <div className="flex justify-between mb-2">
                              <div>
                                <h4 className="font-medium">John D.</h4>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3",
                                        i < 5 ? "fill-freshcart-500 text-freshcart-500" : "text-muted-foreground"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">2 days ago</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Excellent quality, just as described. Very fresh and tasty. Will definitely buy again!
                            </p>
                          </div>
                          
                          <div className="border-b pb-6">
                            <div className="flex justify-between mb-2">
                              <div>
                                <h4 className="font-medium">Sarah M.</h4>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3",
                                        i < 4 ? "fill-freshcart-500 text-freshcart-500" : "text-muted-foreground"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">1 week ago</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Good value for money. Delivery was fast and everything was packaged securely.
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <div>
                                <h4 className="font-medium">Michael P.</h4>
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        "h-3 w-3",
                                        i < 5 ? "fill-freshcart-500 text-freshcart-500" : "text-muted-foreground"
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground">2 weeks ago</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Outstanding quality. The freshest produce I've ordered online. Highly recommend!
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <ProductGrid products={relatedProducts} loading={false} />
        </div>
      </div>
    </>
  );
}
