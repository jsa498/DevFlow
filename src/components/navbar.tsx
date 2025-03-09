'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from './ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import CartModal from './cart/cart-modal';
import { useSupabaseAuth } from './providers/supabase-auth-provider';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSupabaseAuth();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close sheet when pathname changes (navigation occurs)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex justify-center sticky top-4 z-50 pointer-events-none">
      <div className="bg-muted backdrop-blur-lg rounded-full px-4 py-2 shadow-lg pointer-events-auto inline-flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg hover:opacity-80 transition-opacity">
            DevFlow
          </Link>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/" 
              className={`px-4 py-2 transition-colors hover:text-primary ${
                pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`px-4 py-2 transition-colors hover:text-primary ${
                pathname === '/products' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Products
            </Link>
            <Link 
              href="/courses" 
              className={`px-4 py-2 transition-colors hover:text-primary ${
                pathname === '/courses' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Courses
            </Link>
            <Link 
              href="/build" 
              className={`px-4 py-2 transition-colors hover:text-primary ${
                pathname === '/build' ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              Build
            </Link>
          </div>
        </div>
        
        {/* Right side: theme toggle and auth */}
        <div className="flex items-center gap-4">
          {/* Cart Modal */}
          <CartModal />
          
          <ThemeToggle />
          
          {/* Desktop auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || 'User'} />
                      <AvatarFallback>{getInitials(user.user_metadata?.full_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="/signin">Sign in</Link>
              </Button>
            )}
          </div>
          
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full relative p-2 hover:bg-muted transition-colors"
                  // Increase tap target while keeping visual size
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="absolute inset-0" /> {/* Invisible touch target extender */}
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right"
                className="w-full sm:w-80 p-0" // Remove default padding for custom control
              >
                <div className="flex flex-col h-full">
                  {/* Header with larger close target */}
                  <div className="p-4 flex justify-end">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5 text-black dark:text-white" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>

                  {/* Navigation links with larger touch targets */}
                  <div className="flex-1 overflow-auto px-4 pb-6">
                    <nav className="space-y-2">
                      <Link 
                        href="/"
                        className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-all hover:bg-muted/50 active:bg-muted ${
                          pathname === '/' ? 'bg-muted text-primary' : 'text-foreground'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Home
                      </Link>
                      <Link 
                        href="/products"
                        className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-all hover:bg-muted/50 active:bg-muted ${
                          pathname === '/products' ? 'bg-muted text-primary' : 'text-foreground'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Products
                      </Link>
                      <Link 
                        href="/courses"
                        className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-all hover:bg-muted/50 active:bg-muted ${
                          pathname === '/courses' ? 'bg-muted text-primary' : 'text-foreground'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Courses
                      </Link>
                      <Link 
                        href="/build"
                        className={`flex items-center min-h-[48px] px-4 rounded-xl text-base font-medium transition-all hover:bg-muted/50 active:bg-muted ${
                          pathname === '/build' ? 'bg-muted text-primary' : 'text-foreground'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Build
                      </Link>
                    </nav>

                    {/* User section with improved spacing and touch targets */}
                    <div className="mt-6 pt-6 border-t border-border">
                      {user ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 px-4 py-2">
                            <Avatar className="h-10 w-10"> {/* Slightly larger avatar */}
                              <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || 'User'} />
                              <AvatarFallback>{getInitials(user.user_metadata?.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0"> {/* Prevent text overflow */}
                              <p className="text-sm font-medium truncate">{user.user_metadata?.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="space-y-2 px-4">
                            <Button 
                              variant="outline" 
                              asChild 
                              className="w-full h-12 rounded-xl justify-start text-base font-medium"
                            >
                              <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setIsOpen(false);
                                handleSignOut();
                              }}
                              className="w-full h-12 rounded-xl justify-start text-base font-medium text-foreground dark:text-foreground hover:text-foreground"
                            >
                              Sign out
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4">
                          <Button 
                            asChild 
                            className="w-full h-12 rounded-xl text-base font-medium"
                          >
                            <Link href="/signin">Sign in</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}; 