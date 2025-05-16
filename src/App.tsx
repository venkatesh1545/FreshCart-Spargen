
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { Layout } from "@/components/Layout/Layout";

// Pages
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import WishlistPage from "@/pages/WishlistPage";
import CategoriesPage from "@/pages/CategoriesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerificationSuccessPage from "@/pages/VerificationSuccessPage";
import AccountProfilePage from "@/pages/AccountProfilePage";
import AccountOrdersPage from "@/pages/AccountOrdersPage";
import AccountAddressesPage from "@/pages/AccountAddressesPage";
import AccountPaymentMethodsPage from "@/pages/AccountPaymentMethodsPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/verification-success" element={<VerificationSuccessPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/account/profile" element={<AccountProfilePage />} />
                  <Route path="/account/orders" element={<AccountOrdersPage />} />
                  <Route path="/account/addresses" element={<AccountAddressesPage />} />
                  <Route path="/account/payment" element={<AccountPaymentMethodsPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
