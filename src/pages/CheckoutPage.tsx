
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { AddressForm } from '@/components/Checkout/AddressForm';
import { PaymentForm } from '@/components/Checkout/PaymentForm';
import { OrderSummary } from '@/components/Checkout/OrderSummary';
import { CheckoutProgress } from '@/components/Checkout/CheckoutProgress';
import { CheckoutFormData } from '@/components/Checkout/types';

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
      navigate('/login');
      return;
    }
    
    try {
      console.log("Placing order for user:", user.id);
      
      // Create formatted shipping address
      const formattedAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      
      // Save complete address to user profile
      await supabase
        .from('profiles')
        .update({
          full_name: `${formData.firstName} ${formData.lastName}`,
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
      
      // Create order in database with explicit user_id
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
        console.error("Order creation error:", orderError);
        throw new Error(orderError.message);
      }
      
      console.log("Order created:", orderData);
      
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
        console.error("Order items error:", itemsError);
        throw new Error(itemsError.message);
      }
      
      console.log("Order items created successfully");
      console.log("User ID:", user.id);
      console.log("Order ID:", orderData.id);
      
      toast({
        title: "Order placed successfully!",
        description: `Thank you for your order. Your order number is #${orderData.id.slice(0, 8)}`,
      });
      
      clearCart();
      setLoading(false);
      navigate(`/order-success?id=${orderData.id}`);
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
          <CheckoutProgress currentStep={currentStep} />
          
          {currentStep === 'address' && (
            <Card>
              <AddressForm 
                formData={formData} 
                onChange={handleInputChange} 
                onSubmit={handleNextStep}
              />
            </Card>
          )}
          
          {currentStep === 'payment' && (
            <Card>
              <PaymentForm 
                formData={formData}
                loading={loading}
                total={total}
                onBack={() => setCurrentStep('address')}
                onSubmit={handleSubmit}
                onPaymentMethodChange={handlePaymentChange}
                onInputChange={handleInputChange}
              />
            </Card>
          )}
        </div>
        
        {/* Order Summary */}
        <div>
          <OrderSummary 
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
