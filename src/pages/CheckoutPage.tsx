
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  CreditCard, 
  MapPin, 
  Package,
  Phone,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'card' | 'paypal' | 'apple' | 'phonepe' | 'paytm' | 'googlepay' | 'cash';
  upiId?: string;
}

export default function CheckoutPage() {
  const { items, getCartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card',
    upiId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');
  
  // Fetch user profile data when component loads
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        // Split the name into first and last
        const fullName = data.full_name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Parse address if it exists
        let address = '', city = '', state = '', zipCode = '';
        if (data.address) {
          const addressParts = data.address.split(', ');
          address = addressParts[0] || '';
          city = addressParts[1] || '';
          const stateZip = addressParts[2] || '';
          if (stateZip) {
            const stateZipParts = stateZip.split(' ');
            state = stateZipParts[0] || '';
            zipCode = stateZipParts[1] || '';
          }
        }
        
        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          phone: data.phone || '',
          address,
          city,
          state,
          zipCode
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePaymentChange = (value: CheckoutFormData['paymentMethod']) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };
  
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to place an order.',
      });
      setLoading(false);
      return;
    }
    
    try {
      // Create formatted shipping address
      const formattedAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      // Save complete address to user profile
      await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          address: formattedAddress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      // Calculate cart totals
      const subtotal = getCartSubtotal();
      const shipping = subtotal > 50 ? 0 : 4.99;
      const tax = subtotal * 0.07;
      const total = subtotal + shipping + tax;
      
      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: formData.paymentMethod === 'cash' ? 'pending_cod' : 'pending',
          shipping_address: formattedAddress,
          payment_method: formData.paymentMethod,
        })
        .select()
        .single();
      
      if (orderError) {
        throw orderError;
      }
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        throw itemsError;
      }
      
      toast({
        title: "Order placed successfully!",
        description: `Thank you for your order. Your order number is #${orderData.id.slice(0, 8)}`,
      });
      
      clearCart();
      setLoading(false);
      navigate('/order-success');
    } catch (error: any) {
      console.error("Order error:", error);
      toast({
        variant: 'destructive',
        title: 'Error placing order',
        description: error.message || 'An error occurred while placing your order.',
      });
      setLoading(false);
    }
  };
  
  // Cart calculations
  const subtotal = getCartSubtotal();
  const shipping = subtotal > 50 ? 0 : 4.99;
  const tax = subtotal * 0.07;
  const total = subtotal + shipping + tax;
  
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep === 'address' ? 'bg-freshcart-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              <MapPin className="h-5 w-5" />
            </div>
            <div className="h-1 flex-1 bg-muted rounded-full">
              <div className={`h-full bg-freshcart-500 rounded-full ${currentStep === 'payment' ? 'w-full' : 'w-0'} transition-all duration-300`}></div>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-freshcart-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          
          {currentStep === 'address' && (
            <form onSubmit={handleNextStep}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        required 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          name="state" 
                          value={formData.state} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input 
                          id="zipCode" 
                          name="zipCode" 
                          value={formData.zipCode} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button type="submit">Continue to Payment</Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
          
          {currentStep === 'payment' && (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                  
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value: any) => handlePaymentChange(value)}
                    className="space-y-4"
                  >
                    {/* Credit Card */}
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="cursor-pointer flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit / Debit Card
                        </Label>
                      </div>
                      <div className="flex gap-1">
                        <div className="bg-blue-500 h-6 w-10 rounded"></div>
                        <div className="bg-red-500 h-6 w-10 rounded"></div>
                        <div className="bg-green-500 h-6 w-10 rounded"></div>
                      </div>
                    </div>
                    
                    {/* PhonePe */}
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="phonepe" id="phonepe" />
                      <Label htmlFor="phonepe" className="cursor-pointer flex items-center gap-2">
                        <Phone className="h-4 w-4 text-purple-600" />
                        PhonePe UPI
                      </Label>
                    </div>
                    
                    {/* Paytm */}
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="paytm" id="paytm" />
                      <Label htmlFor="paytm" className="cursor-pointer flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Paytm UPI
                      </Label>
                    </div>
                    
                    {/* Google Pay */}
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="googlepay" id="googlepay" />
                      <Label htmlFor="googlepay" className="cursor-pointer flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-600" />
                        Google Pay UPI
                      </Label>
                    </div>
                    
                    {/* Cash on Delivery */}
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="cursor-pointer flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Cash on Delivery
                      </Label>
                    </div>
                    
                    {/* Other payment methods */}
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 9.2c.4 1-.5 2-1.7 2H12v2h3.7c1 0 2.1.8 2.3 1.8.3 1.4-.7 2.2-1.7 2.2H12" />
                          <path d="M9.8 16H7c-1.2 0-1.7-.9-1.3-2L9.5 4.2c.4-1.1 1.5-2 2.5-2h3.7c1.3 0 2.2.8 2 1.8l-1.4 5" />
                        </svg>
                        PayPal
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="apple" id="apple" />
                      <Label htmlFor="apple" className="cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                          <path d="M10 2c1 .5 2 2 2 5" />
                        </svg>
                        Apple Pay
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Show appropriate payment details form based on selected method */}
                  
                  {/* UPI Payment Details (for PhonePe, Paytm, Google Pay) */}
                  {(formData.paymentMethod === 'phonepe' || formData.paymentMethod === 'paytm' || formData.paymentMethod === 'googlepay') && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          name="upiId"
                          placeholder="yourname@upi"
                          value={formData.upiId}
                          onChange={handleInputChange}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Please enter your {formData.paymentMethod === 'phonepe' ? 'PhonePe' : formData.paymentMethod === 'paytm' ? 'Paytm' : 'Google Pay'} UPI ID
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Cash on Delivery Message */}
                  {formData.paymentMethod === 'cash' && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <p className="text-sm">
                        You will pay when your order is delivered. Please have the exact amount ready.
                      </p>
                    </div>
                  )}
                  
                  {/* Card Payment Details */}
                  {formData.paymentMethod === 'card' && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber" 
                          placeholder="0000 0000 0000 0000" 
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate" 
                            placeholder="MM/YY" 
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv" 
                            placeholder="123" 
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="nameOnCard">Name on Card</Label>
                        <Input
                          id="nameOnCard" 
                          placeholder="John Doe" 
                          required
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setCurrentStep('address')}
                    >
                      Back
                    </Button>
                    
                    <Button type="submit" className="flex gap-2" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          {formData.paymentMethod === 'cash' ? 'Place Order' : `Pay ₹${total.toFixed(2)}`}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </div>
        
        {/* Order Summary */}
        <div>
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
        </div>
      </div>
    </div>
  );
}
