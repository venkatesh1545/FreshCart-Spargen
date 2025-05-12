
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useTheme } from '@/providers/ThemeProvider';

export function Layout() {
  const { ThemeToggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Mobile Theme Toggle - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg">
          {ThemeToggle()}
        </div>
      </div>
    </div>
  );
}
