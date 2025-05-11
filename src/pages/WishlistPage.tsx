
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/providers/CartProvider';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlist, addToCart, removeFromWishlist } = useCart();
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const handleRemove = (productId: string) => {
    setRemovingIds(prev => [...prev, productId]);
    
    // Animation delay before actual removal
    setTimeout(() => {
      removeFromWishlist(productId);
      setRemovingIds(prev => prev.filter(id => id !== productId));
    }, 300);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Browse our products and add your favorites to your wishlist.
          </p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div 
              key={product.id} 
              className={cn(
                "rounded-lg border bg-card overflow-hidden transition-all",
                removingIds.includes(product.id) && "opacity-0 scale-95" 
              )}
            >
              {/* Product Image */}
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Link>
              
              {/* Content */}
              <div className="p-4">
                {/* Category */}
                <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                
                {/* Title */}
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-base font-medium line-clamp-2 mb-2 hover:text-freshcart-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                {/* Price */}
                <div className="flex items-end justify-between gap-2 mt-auto">
                  <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                </div>
                
                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="text-xs flex items-center justify-center gap-1"
                    onClick={() => handleRemove(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                  <Button 
                    className="text-xs flex items-center justify-center gap-1"
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
