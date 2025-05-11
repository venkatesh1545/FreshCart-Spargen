
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AccountProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Fetch user profile data from Supabase
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
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
          setName(data.full_name || user.name);
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          phone,
          address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'An error occurred while updating your profile.',
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
          You need to sign in to view this page.
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
                <Link to="/account/profile" className="block py-2 px-3 rounded-md bg-accent text-accent-foreground">
                  Profile
                </Link>
                <Link to="/account/orders" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
                  Orders
                </Link>
                <Link to="/account/addresses" className="block py-2 px-3 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground transition-colors">
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
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
