
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
  
  // Title based on verification type
  const getTitle = () => {
    switch (type) {
      case 'signup':
        return 'Email Verified Successfully!';
      case 'recovery':
        return 'Password Reset Successful!';
      case 'invite':
        return 'Invitation Accepted!';
      case 'magiclink':
        return 'Magic Link Verified!';
      default:
        return 'Verification Successful!';
    }
  };
  
  // Message based on verification type
  const getMessage = () => {
    switch (type) {
      case 'signup':
        return 'Your email has been successfully verified! You can now log in to your account.';
      case 'recovery':
        return 'Your password has been successfully reset! You can now log in with your new password.';
      case 'invite':
        return 'You have successfully accepted the invitation! You can now log in to your account.';
      case 'magiclink':
        return 'Your magic link has been verified! You will be redirected to the application.';
      default:
        return 'Your verification was successful!';
    }
  };

  return (
    <div className="container py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="bg-freshcart-500 text-white rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10" />
          </div>
          
          <CardTitle className="text-3xl font-bold">{getTitle()}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {getMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="bg-muted p-4 rounded-lg mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              You will be redirected to the login page in <span className="font-bold">{countdown}</span> seconds...
            </p>
          </div>
          
          <Button asChild className="w-full">
            <a href="/login">Go to Login Page Now</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
