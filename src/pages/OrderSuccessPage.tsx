import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // Check for order on page load
  useEffect(() => {
    // Clear the cart
    clearCart();
    
    if (user) {
      if (orderId) {
        // If we have a specific order ID, fetch that
        fetchOrderById(orderId);
      } else {
        // Otherwise fetch the latest order
        fetchLatestOrder();
      }
    } else {
      navigate('/login');
    }
  }, [user, orderId]);
  
  const fetchOrderById = async (id: string) => {
    try {
      setLoading(true);
      setOrderError(null);
      
      console.log(`Fetching order with ID: ${id}`);
      
      // Fetch the specific order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (orderError) {
        console.error('Error fetching order:', orderError);
        toast({
          variant: 'destructive',
          title: 'Error fetching order',
          description: orderError.message,
        });
        setOrderError('Failed to fetch order details');
        setLoading(false);
        return;
      }
      
      if (!orderData) {
        console.error(`Order not found for ID: ${id}`);
        
        // Try to find any recent order for this user
        const { data: recentOrder, error: recentOrderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (recentOrderError || !recentOrder) {
          toast({
            variant: 'destructive',
            title: 'Order not found',
            description: `We couldn't find an order with ID: ${id}`,
          });
          setOrderError('Order not found');
          setLoading(false);
          return;
        }
        
        // Use the recent order instead
        console.log(`Found recent order instead: ${recentOrder.id}`);
        
        const foundOrderData = recentOrder;
        
        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', foundOrderData.id);
        
        if (itemsError) {
          console.error('Error fetching order items:', itemsError);
          toast({
            variant: 'destructive',
            title: 'Error fetching order items',
            description: itemsError.message,
          });
          setLoading(false);
          return;
        }
        
        setOrder({
          ...foundOrderData,
          items: itemsData || []
        });
        
        setLoading(false);
        return;
      }
      
      console.log('Order data retrieved:', orderData);
      
      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);
      
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        toast({
          variant: 'destructive',
          title: 'Error fetching order items',
          description: itemsError.message,
        });
        setLoading(false);
        return;
      }
      
      setOrder({
        ...orderData,
        items: itemsData || []
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while fetching the order.',
      });
      setOrderError('Failed to load order details');
      setLoading(false);
    }
  };
  
  const fetchLatestOrder = async () => {
    try {
      setLoading(true);
      setOrderError(null);
      
      // Fetch the most recent order for the current user
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (orderError) {
        console.error('Error fetching order:', orderError);
        toast({
          variant: 'destructive',
          title: 'Error fetching latest order',
          description: orderError.message,
        });
        setOrderError('Failed to fetch latest order');
        setLoading(false);
        return;
      }
      
      if (!orderData) {
        console.error('No recent orders found');
        toast({
          variant: 'destructive',
          title: 'No orders found',
          description: 'You don\'t have any recent orders.',
        });
        setOrderError('No orders found');
        setLoading(false);
        return;
      }
      
      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);
      
      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        toast({
          variant: 'destructive',
          title: 'Error fetching order items',
          description: itemsError.message,
        });
        setLoading(false);
        return;
      }
      
      setOrder({
        ...orderData,
        items: itemsData || []
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An error occurred while fetching the latest order.',
      });
      setOrderError('Failed to load order details');
      setLoading(false);
    }
  };
  
  // Generate a random order number if we couldn't fetch one
  const orderNumber = order ? order.id.slice(0, 8) : Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'paypal': return 'PayPal';
      case 'apple': return 'Apple Pay';
      case 'phonepe': return 'PhonePe UPI';
      case 'paytm': return 'Paytm UPI';
      case 'googlepay': return 'Google Pay UPI';
      case 'cash': return 'Cash on Delivery';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Retry fetching order
  const retryOrderFetch = () => {
    if (orderId) {
      fetchOrderById(orderId);
    } else {
      fetchLatestOrder();
    }
  };
  
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-freshcart-500 text-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your order has been confirmed and will be 
            processed shortly.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 border-4 border-freshcart-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orderError ? (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTitle>Order Error</AlertTitle>
              <AlertDescription>
                {orderError}. Please try again or contact support if this issue persists.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button onClick={retryOrderFetch}>
                Retry Loading Order
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-freshcart-500" />
                <span className="font-medium">Order #{orderNumber}</span>
              </div>
            </div>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <Package className="h-5 w-5 text-freshcart-500" />
                    <span className="font-medium">Order #{orderNumber}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.created_at)}
                  </div>
                </div>
                
                <Separator className="mb-6" />
                
                {/* Order items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.product_image ? (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.quantity} × ₹{item.price.toFixed(2)}</span>
                          <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="mb-6" />
                
                {/* Order summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span>{formatPaymentMethod(order.payment_method)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Address</span>
                    <span className="text-right">{order.shipping_address}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {order.status === 'pending_cod' ? 'Pending (COD)' : order.status}
                    </span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center px-4 py-6 bg-green-50 rounded-lg">
              <p className="text-lg font-medium text-green-800 mb-2">
                Your order has been received!
              </p>
              <p className="text-green-600 mb-4">
                {user?.email ? `A confirmation will be sent to ${user.email}.` : 'Thank you for your order.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-lg mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-freshcart-500" />
              <span className="font-medium">Order #{orderNumber}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Thank you for your order!
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
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
