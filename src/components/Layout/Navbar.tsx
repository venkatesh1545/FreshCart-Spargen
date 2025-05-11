
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Heart, Menu, Moon, Search, ShoppingCart, Sun, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { getCartCount, wishlist } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { startListening, isListening, transcript, isSpeechSupported } = useSpeechRecognition({
    onResult: (transcript) => {
      setSearchQuery(transcript);
      // Auto search after receiving voice input
      if (transcript) {
        navigate(`/products?search=${encodeURIComponent(transcript)}`);
      }
    },
    onError: (error) => console.error(error)
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-72">
              <div className="flex flex-col gap-6 pt-4">
                <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
                  <span className="text-freshcart-600">Fresh</span>Cart
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link to="/" className="text-lg hover:text-freshcart-600 transition-colors">Home</Link>
                  <Link to="/products" className="text-lg hover:text-freshcart-600 transition-colors">Products</Link>
                  <Link to="/categories" className="text-lg hover:text-freshcart-600 transition-colors">Categories</Link>
                  <Link to="/wishlist" className="text-lg hover:text-freshcart-600 transition-colors">Wishlist</Link>
                  <Link to="/cart" className="text-lg hover:text-freshcart-600 transition-colors">Cart</Link>
                  {user?.isAdmin && (
                    <Link to="/admin" className="text-lg hover:text-freshcart-600 transition-colors">Admin Dashboard</Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <span className="hidden font-bold text-2xl sm:inline-block">
              <span className="text-freshcart-600">Fresh</span>Cart
            </span>
            <span className="font-bold text-xl sm:hidden">
              <span className="text-freshcart-600">F</span>C
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-freshcart-600 transition-colors">Home</Link>
            <Link to="/products" className="text-sm font-medium hover:text-freshcart-600 transition-colors">Products</Link>
            <Link to="/categories" className="text-sm font-medium hover:text-freshcart-600 transition-colors">Categories</Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-sm font-medium hover:text-freshcart-600 transition-colors">Admin</Link>
            )}
          </nav>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-full max-w-sm">
          <Input
            type="search"
            placeholder="Search products..."
            className="pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSpeechSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-8 top-0"
              onClick={() => startListening()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isListening ? 'text-freshcart-600 animate-pulse' : ''}
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              <span className="sr-only">Voice search</span>
            </Button>
          )}
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:flex">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex relative">
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {wishlist.length}
                </Badge>
              )}
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {getCartCount()}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders">Your Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile search */}
      <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSpeechSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-8 top-0"
              onClick={() => startListening()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isListening ? 'text-freshcart-600 animate-pulse' : ''}
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
              <span className="sr-only">Voice search</span>
            </Button>
          )}
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>
    </header>
  );
}
