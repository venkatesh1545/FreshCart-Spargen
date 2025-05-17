
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  socialLogin: (provider: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Set up auth state change listener and check for existing session
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          await transformUser(currentSession.user);
        } else {
          setUser(null);
        }
        
        // Handle email verification success
        if (event === 'SIGNED_IN') {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('type') === 'signup' && currentSession?.user?.email_confirmed_at) {
            toast({
              title: "Email verified successfully!",
              description: "Your email has been verified. You can now use all features of the app.",
            });
          }
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        await transformUser(currentSession.user);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Transform Supabase user to our app's User format
  const transformUser = async (supabaseUser: SupabaseUser) => {
    // Get user profile data from our profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', supabaseUser.id)
      .single();

    // Default to email for name if profile not found
    const name = profile?.full_name || supabaseUser.email?.split('@')[0] || 'User';

    // Check if email is confirmed
    const emailVerified = supabaseUser.email_confirmed_at !== null;

    setUser({
      id: supabaseUser.id,
      name: name,
      email: supabaseUser.email || '',
      // For this simple app, we'll consider anyone with @freshcart.com email as admin
      isAdmin: (supabaseUser.email || '').endsWith('@freshcart.com'),
      emailVerified: emailVerified
    });
    
    console.log("User transformed:", {
      id: supabaseUser.id,
      name: name,
      email: supabaseUser.email || '',
      emailVerified: emailVerified
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        setLoading(false);
        return false;
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please check your email and confirm your account before logging in.",
        });
        await supabase.auth.signOut();
        setLoading(false);
        return false;
      }

      toast({
        title: "Login successful!",
        description: `Welcome back!`,
      });
      setLoading(false);
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An error occurred during login.",
      });
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/verification-success?type=signup&email=${encodeURIComponent(email)}`,
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
        setLoading(false);
        return false;
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account before logging in.",
      });
      setLoading(false);
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
      });
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
      return;
    }
    
    setUser(null);
    setSession(null);
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out.",
    });
  };

  const socialLogin = async (provider: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Convert provider string to OAuth provider
      const providerType = provider.toLowerCase() as 'google' | 'facebook' | 'github';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerType,
        options: {
          redirectTo: `${window.location.origin}/verification-success?type=social&provider=${providerType}`,
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Social login failed",
          description: error.message,
        });
        setLoading(false);
        return false;
      }
      
      // We don't immediately set the user here because the OAuth flow will trigger 
      // the onAuthStateChange event when completed

      setLoading(false);
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Social login failed",
        description: error.message || "An error occurred during login.",
      });
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
