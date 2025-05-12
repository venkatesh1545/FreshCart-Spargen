
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

interface AddressFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddressForm = ({ formData, onChange, onSubmit }: AddressFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              value={formData.firstName} 
              onChange={onChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={formData.lastName} 
              onChange={onChange} 
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
              onChange={onChange} 
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
              onChange={onChange} 
              required 
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={onChange} 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              name="city" 
              value={formData.city} 
              onChange={onChange} 
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
                onChange={onChange} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input 
                id="zipCode" 
                name="zipCode" 
                value={formData.zipCode} 
                onChange={onChange} 
                required 
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button type="submit">Continue to Payment</Button>
        </div>
      </CardContent>
    </form>
  );
};
