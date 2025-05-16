
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Plus, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AccountAddressesPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchUserAddress();
    }
  }, [user]);
  
  const fetchUserAddress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('address')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setAddress(data?.address || null);
    } catch (error: any) {
      console.error('Error fetching address:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your address information.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Account Access Required</h1>
        <p className="mb-6 text-muted-foreground">
          You need to sign in to view your addresses.
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
                <Link to="/account/addresses" className="block py-2 px-3 rounded-md bg-accent text-accent-foreground">
                  Addresses
                </Link>
                <Link to="/account/payment" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
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
              <CardTitle className="text-2xl">My Addresses</CardTitle>
              <CardDescription>
                Manage your delivery addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-freshcart-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div>
                  {address ? (
                    <div className="border rounded-lg p-4 mb-4 relative">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-freshcart-500 mt-0.5" />
                        <div>
                          <p className="font-medium">{user.name || 'Home Address'}</p>
                          <p className="text-muted-foreground mt-1">{address}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="absolute top-2 right-2"
                        asChild
                      >
                        <Link to="/account/profile">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="flex justify-center mb-4">
                        <MapPin className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">You haven't added any addresses yet.</p>
                      <Button asChild>
                        <Link to="/account/profile">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Address
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
