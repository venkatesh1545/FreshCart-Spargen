import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Phone, Wallet } from 'lucide-react';

type PaymentMethod = 'card' | 'paypal' | 'apple' | 'phonepe' | 'paytm' | 'googlepay' | 'cash';

interface PaymentFormData {
  paymentMethod: PaymentMethod;
  upiId?: string;
}

interface PaymentFormProps {
  formData: PaymentFormData;
  loading: boolean;
  total: number;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PaymentForm = ({
  formData,
  loading,
  total,
  onBack,
  onSubmit,
  onPaymentMethodChange,
  onInputChange
}: PaymentFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        
        <RadioGroup 
          value={formData.paymentMethod} 
          onValueChange={(value: any) => onPaymentMethodChange(value)}
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
                onChange={onInputChange}
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
            onClick={onBack}
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
    </form>
  );
};
