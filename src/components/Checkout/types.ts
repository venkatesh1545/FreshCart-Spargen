
export type PaymentMethod = 'card' | 'paypal' | 'apple' | 'phonepe' | 'paytm' | 'googlepay' | 'cash';

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: PaymentMethod;
  upiId?: string;
}
