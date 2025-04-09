
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, BookOpen, Library, BarChart3, Menu, X, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import AuthButton from '@/components/AuthButton';

const Header = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const location = useLocation();
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const NavLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon: React.ReactNode }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          isActive 
            ? 'bg-primary/10 text-primary font-medium' 
            : 'text-foreground hover:bg-muted'
        }`}
      >
        {icon}
        {children}
      </Link>
    );
  };

  const MobileNavLink = ({ to, children, icon, onClose }: { to: string; children: React.ReactNode; icon: React.ReactNode; onClose: () => void }) => {
    const isActive = location.pathname === to;
    return (
      <SheetClose asChild>
        <Link 
          to={to} 
          className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
            isActive 
              ? 'bg-primary/10 text-primary font-medium' 
              : 'text-foreground hover:bg-muted'
          }`}
          onClick={onClose}
        >
          {icon}
          <span className="text-lg">{children}</span>
        </Link>
      </SheetClose>
    );
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:from-indigo-400 dark:to-purple-400">Readure</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/library" icon={<Library className="h-4 w-4" />}>
              Library
            </NavLink>
            <NavLink to="/analytics" icon={<BarChart3 className="h-4 w-4" />}>
              Analytics
            </NavLink>
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:from-indigo-400 dark:to-purple-400">
                      Readure
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-1 py-4">
                  <MobileNavLink 
                    to="/" 
                    icon={<BookOpen className="h-5 w-5" />} 
                    onClose={() => {}}
                  >
                    Home
                  </MobileNavLink>
                  <MobileNavLink 
                    to="/library" 
                    icon={<Library className="h-5 w-5" />} 
                    onClose={() => {}}
                  >
                    Library
                  </MobileNavLink>
                  <MobileNavLink 
                    to="/analytics" 
                    icon={<BarChart3 className="h-5 w-5" />} 
                    onClose={() => {}}
                  >
                    Analytics
                  </MobileNavLink>
                  <MobileNavLink 
                    to="/auth" 
                    icon={<User className="h-5 w-5" />} 
                    onClose={() => {}}
                  >
                    Account
                  </MobileNavLink>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleTheme} 
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{darkMode ? "Switch to light mode" : "Switch to dark mode"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Auth Button */}
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
