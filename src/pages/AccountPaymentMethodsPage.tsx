
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { CreditCard, Plus } from 'lucide-react';

export default function AccountPaymentMethodsPage() {
  const { user, logout } = useAuth();
  const [loading] = useState(false);
  
  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Account Access Required</h1>
        <p className="mb-6 text-muted-foreground">
          You need to sign in to view your payment methods.
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
                <Link to="/account/orders" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
                  Orders
                </Link>
                <Link to="/account/addresses" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
                  Addresses
                </Link>
                <Link to="/account/payment" className="block py-2 px-3 rounded-md bg-accent text-accent-foreground">
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
              <CardTitle className="text-2xl">Payment Methods</CardTitle>
              <CardDescription>
                Manage your saved payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-freshcart-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <CreditCard className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">You haven't added any payment methods yet.</p>
                  <p className="text-sm text-muted-foreground mb-6">Payment methods are temporarily saved during checkout.</p>
                  <Button asChild>
                    <Link to="/products">
                      <Plus className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Link>
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
