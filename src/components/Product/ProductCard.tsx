
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Add with animation
    setTimeout(() => {
      addToCart(product);
      setIsAddingToCart(false);
    }, 300);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product);
    navigate('/checkout');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="group block"
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative rounded-lg border border-border bg-card overflow-hidden product-card-hover">
        {/* Badge area */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {product.isExpress && (
            <Badge variant="secondary" className="bg-freshcart-500 hover:bg-freshcart-600 text-white">Express</Badge>
          )}
          {product.isNewlyAdded && (
            <Badge variant="outline" className="bg-background border-freshcart-500 text-freshcart-700">New</Badge>
          )}
          {product.badges?.map((badge, index) => (
            <Badge key={index} variant="outline" className="bg-background">
              {badge}
            </Badge>
          ))}
        </div>

        {/* Wishlist button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute top-2 right-2 z-10 rounded-full bg-background/90 backdrop-blur-sm",
            isInWishlist(product.id) && "text-red-500 border-red-500"
          )}
          onClick={handleWishlistToggle}
          aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4", 
            isInWishlist(product.id) && "fill-red-500")} />
        </Button>

        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>

          {/* Title */}
          <h3 className="text-base font-medium line-clamp-2 mb-2 group-hover:text-freshcart-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(product.rating) ? "fill-freshcart-500 text-freshcart-500" : "text-muted-foreground"
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div>
              <span className="text-lg font-semibold flex items-center">
                <span className="mr-0.5">₹</span>
                {product.price.toFixed(2)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Buy Now button */}
              <Button 
                size="sm"
                variant="default" 
                className="flex items-center gap-1"
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                aria-label="Buy now"
              >
                <span className="sm:inline">Buy Now</span>
              </Button>

              {/* Add to cart button */}
              <Button 
                size="sm"
                variant="outline" 
                className={cn(
                  "flex items-center gap-1 transition-all", 
                  isAddingToCart && "animate-cart-bounce bg-freshcart-50"
                )} 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock status */}
          {product.stock <= 0 && (
            <p className="text-xs text-destructive mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
