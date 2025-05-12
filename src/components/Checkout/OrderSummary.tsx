
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/providers/CartProvider';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const OrderSummary = ({ items, subtotal, shipping, tax, total }: OrderSummaryProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        
        {/* Items */}
        <div className="space-y-4 mb-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <img 
                  src={item.product.image} 
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {item.product.name}
                </h4>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{item.quantity} × ₹{item.product.price.toFixed(2)}</span>
                  <span>₹{(item.quantity * item.product.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            {shipping === 0 ? (
              <span className="text-freshcart-600">Free</span>
            ) : (
              <span>₹{shipping.toFixed(2)}</span>
            )}
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (7%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
