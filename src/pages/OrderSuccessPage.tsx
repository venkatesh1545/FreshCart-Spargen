
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export default function OrderSuccessPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<string>('');
  
  // Check for the latest order on page load
  useEffect(() => {
    // Redirect if accessing this page directly with items in cart
    if (items.length > 0) {
      navigate('/cart');
      return;
    }
    
    // Fetch the latest order
    if (user) {
      fetchLatestOrder();
    }
    
    // Clear the cart just in case
    clearCart();
  }, [user]);
  
  const fetchLatestOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching order:', error);
        return;
      }
      
      if (data) {
        // Use the first 8 characters of the UUID as the display order number
        setOrderId(data.id.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };
  
  // Generate a random order number if we couldn't fetch one
  const orderNumber = orderId || Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
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
