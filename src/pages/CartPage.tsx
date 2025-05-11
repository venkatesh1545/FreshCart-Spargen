
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleQuantityChange = (productId: string, delta: number, currentQty: number) => {
    const newQty = Math.max(1, currentQty + delta);
    updateQuantity(productId, newQty);
  };

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    
    // Animation delay before actual removal
    setTimeout(() => {
      removeFromCart(productId);
      setRemovingId(null);
    }, 300);
  };

  const subtotal = getCartSubtotal();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border shadow-sm divide-y">
              {/* Header */}
              <div className="hidden md:grid md:grid-cols-5 p-4 bg-muted/50">
                <div className="md:col-span-2">
                  <h3 className="font-medium">Product</h3>
                </div>
                <div>
                  <h3 className="font-medium">Price</h3>
                </div>
                <div>
                  <h3 className="font-medium">Quantity</h3>
                </div>
                <div>
                  <h3 className="font-medium text-right">Subtotal</h3>
                </div>
              </div>
              
              {/* Items */}
              <div>
                {items.map((item) => (
                  <div 
                    key={item.product.id}
                    className={cn(
                      "grid grid-cols-1 md:grid-cols-5 p-4 gap-4 transition-opacity duration-300",
                      removingId === item.product.id && "opacity-0"
                    )}
                  >
                    {/* Product */}
                    <div className="md:col-span-2 flex gap-4">
                      {/* Image */}
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex flex-col">
                        <Link 
                          to={`/product/${item.product.id}`}
                          className="font-medium hover:text-freshcart-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          {item.product.category}
                        </span>
                        
                        {/* Mobile: Price */}
                        <div className="md:hidden mt-2 text-sm">
                          ${item.product.price.toFixed(2)} each
                        </div>
                        
                        {/* Mobile: Remove button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="md:hidden self-start mt-2 h-8 px-2 text-xs text-muted-foreground"
                          onClick={() => handleRemove(item.product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    {/* Price - Desktop */}
                    <div className="hidden md:flex items-center">
                      ${item.product.price.toFixed(2)}
                    </div>
                    
                    {/* Quantity */}
                    <div className="flex items-center">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(item.product.id, -1, item.quantity)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 rounded-none"
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQuantityChange(item.product.id, 1, item.quantity)}
                          className="h-8 w-8 rounded-none"
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="flex items-center justify-between md:justify-end">
                      <span className="md:hidden">Subtotal:</span>
                      <span className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Remove button - Desktop */}
                    <div className="hidden md:flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground"
                        onClick={() => handleRemove(item.product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <div className="mt-6">
              <Button variant="outline" asChild className="flex items-center gap-2">
                <Link to="/products">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-freshcart-600">Free</span>
                    ) : (
                      <span>${shipping.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (7%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  {subtotal < 50 && (
                    <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                      <p>
                        Add <span className="font-medium">${(50 - subtotal).toFixed(2)}</span> more to qualify for free shipping!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
