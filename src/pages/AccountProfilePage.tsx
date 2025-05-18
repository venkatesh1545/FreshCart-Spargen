
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

export default function AccountProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Expanded form fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
          
          // Parse the address if it exists
          if (data.address) {
            const addressParts = data.address.split(', ');
            setAddress(addressParts[0] || '');
            setCity(addressParts[1] || '');
            
            if (addressParts[2]) {
              const stateZipParts = addressParts[2].split(' ');
              setState(stateZipParts[0] || '');
              setPincode(stateZipParts[1] || '');
            }
          }
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
      // Format the address
      const formattedAddress = `${address}, ${city}, ${state} ${pincode}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          phone,
          address: formattedAddress,
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
  
  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmEmail !== user.email) {
      toast({
        variant: 'destructive',
        title: 'Verification failed',
        description: 'Please enter your email correctly to confirm account deletion.',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Instead of using the admin.deleteUser endpoint, we'll use the standard user deletion
      const { error } = await supabase.auth.deleteUser();
      
      if (error) {
        throw error;
      }
      
      // On successful deletion, log out the user
      await logout();
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been successfully deleted.',
      });
      
      // Redirect to home page
      navigate('/');
      
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error.message || 'An error occurred while deleting your account.',
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
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
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address Line</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address, apartment, etc."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pincode">PIN Code</Label>
                    <Input
                      id="pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="PIN code"
                      maxLength={6}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Delete Account Card */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-2xl text-red-500">Delete Account</CardTitle>
              <CardDescription>
                Permanently remove your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                This action cannot be undone. Once your account is deleted, all of your data will be permanently removed.
              </p>
              
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">
                      To confirm, please enter your email address:
                    </p>
                    <Input
                      type="email"
                      placeholder="your-email@example.com"
                      value={deleteConfirmEmail}
                      onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteAccount();
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
