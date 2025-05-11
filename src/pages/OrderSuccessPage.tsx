
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/providers/CartProvider';

export default function OrderSuccessPage() {
  const { items } = useCart();
  const navigate = useNavigate();
  
  // Redirect if accessing this page directly (no items in order)
  useEffect(() => {
    if (items.length > 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);
  
  // Generate a random order number
  const orderNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-freshcart-500 text-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. Your order has been confirmed and will be 
          processed shortly.
        </p>
        
        <div className="bg-muted p-4 rounded-lg mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-freshcart-500" />
            <span className="font-medium">Order #{orderNumber}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to your email address.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" className="flex-1">
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/account/orders">Track Order</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
