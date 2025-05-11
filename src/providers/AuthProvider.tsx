
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
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

// Mock users data
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@freshcart.com', isAdmin: true },
  { id: '2', name: 'Regular User', email: 'user@example.com', isAdmin: false },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('freshcart-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('freshcart-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && password === 'password') { // Very simple password check for demo
      setUser(foundUser);
      localStorage.setItem('freshcart-user', JSON.stringify(foundUser));
      toast({
        title: "Login successful!",
        description: `Welcome back, ${foundUser.name}!`,
      });
      setLoading(false);
      return true;
    }
    
    toast({
      variant: "destructive",
      title: "Login failed",
      description: "Invalid email or password. Please try again.",
    });
    setLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Email already in use. Please try a different email.",
      });
      setLoading(false);
      return false;
    }
    
    const newUser: User = {
      id: `${mockUsers.length + 1}`,
      name,
      email,
      isAdmin: false,
    };
    
    // In a real app, we would add this to the database
    // For now, we'll just set the user
    setUser(newUser);
    localStorage.setItem('freshcart-user', JSON.stringify(newUser));
    
    toast({
      title: "Registration successful!",
      description: `Welcome to FreshCart, ${name}!`,
    });
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freshcart-user');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out.",
    });
  };

  const socialLogin = async (provider: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock social login
    const socialUser: User = {
      id: '999',
      name: `${provider} User`,
      email: `${provider.toLowerCase()}user@example.com`,
      isAdmin: false,
    };
    
    setUser(socialUser);
    localStorage.setItem('freshcart-user', JSON.stringify(socialUser));
    
    toast({
      title: "Social login successful!",
      description: `Welcome, ${socialUser.name}!`,
    });
    setLoading(false);
    return true;
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
