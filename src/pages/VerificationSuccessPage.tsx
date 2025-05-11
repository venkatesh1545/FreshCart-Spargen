
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  // Get type parameter to determine what kind of verification was successful
  const type = searchParams.get('type') || 'signup';
  
  useEffect(() => {
    // Automatically redirect to login page after countdown
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);
    
    // Update countdown every second
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);
  
  // Message based on verification type
  const getMessage = () => {
    switch (type) {
      case 'signup':
        return 'Your email has been successfully verified!';
      case 'recovery':
        return 'Your password has been successfully reset!';
      case 'invite':
        return 'You have successfully accepted the invitation!';
      default:
        return 'Verification successful!';
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-freshcart-500 text-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Verification Successful!</h1>
        
        <p className="text-muted-foreground mb-6">
          {getMessage()}
        </p>
        
        <div className="bg-muted p-4 rounded-lg mb-8">
          <p className="text-sm text-muted-foreground">
            You will be redirected to the login page in {countdown} seconds...
          </p>
        </div>
        
        <Button asChild className="w-full">
          <a href="/login">Go to Login Page Now</a>
        </Button>
      </div>
    </div>
  );
}
