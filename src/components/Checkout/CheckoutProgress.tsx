
import { MapPin, CreditCard } from 'lucide-react';

interface CheckoutProgressProps {
  currentStep: 'address' | 'payment';
}

export const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        currentStep === 'address' ? 'bg-freshcart-500 text-white' : 'bg-muted text-muted-foreground'
      }`}>
        <MapPin className="h-5 w-5" />
      </div>
      <div className="h-1 flex-1 bg-muted rounded-full">
        <div className={`h-full bg-freshcart-500 rounded-full ${
          currentStep === 'payment' ? 'w-full' : 'w-0'
        } transition-all duration-300`}></div>
      </div>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
        currentStep === 'payment' ? 'bg-freshcart-500 text-white' : 'bg-muted text-muted-foreground'
      }`}>
        <CreditCard className="h-5 w-5" />
      </div>
    </div>
  );
};
