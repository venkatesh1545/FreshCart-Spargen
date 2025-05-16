
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Package } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'pending_cod';
  total: number;
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
}

// Status badge styling
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'processing':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'shipped':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    case 'delivered':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'pending_cod':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

export default function AccountOrdersPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders for current user
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (orderError) throw orderError;
      
      if (orderData) {
        // Fetch order items for each order
        const ordersWithItems = await Promise.all(
          orderData.map(async (order) => {
            const { data: itemsData } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);
              
            return {
              ...order,
              items: itemsData || [],
              status: order.status as Order['status'] // Type assertion
            } as Order;
          })
        );
        
        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
  
  // Format status for display
  const formatStatus = (status: Order['status']) => {
    switch (status) {
      case 'pending_cod':
        return 'Pending (COD)';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Account Access Required</h1>
        <p className="mb-6 text-muted-foreground">
          You need to sign in to view your orders.
        </p>
        <Button asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left sidebar navigation */}
        <div className="md:w-64 space-y-2">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <Link to="/account/profile" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
                  Profile
                </Link>
                <Link to="/account/orders" className="block py-2 px-3 rounded-md bg-accent text-accent-foreground">
                  Orders
                </Link>
                <Link to="/account/addresses" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
                  Addresses
                </Link>
                <Link to="/account/payment" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
                  Payment Methods
                </Link>
                <Separator className="my-2" />
                <button
                  onClick={logout}
                  className="w-full text-left py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-freshcart-500 border-t-transparent rounded-full"></div>
                </div>
              ) : orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>₹{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/order-success?id=${order.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                  <Button asChild>
                    <Link to="/products">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
