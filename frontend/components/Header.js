import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCart, useAuth } from '../pages/_app';

export default function Header() {
  const router = useRouter();
  const { cart } = useCart() || { cart: [] };
  const auth = useAuth() || {};
  const user = auth.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => router.pathname === path;
  const isAuthActive = router.pathname === '/login' || router.pathname === '/signup';
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <header className="bg-secondary/90 border-b border-primary/40 sticky top-0 z-20 backdrop-blur">
      <div className="container-max py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <Image
                src="/logo.png"
                alt="AUF Karachi Sofas Logo"
                width={40}
                height={40}
                className="h-10 w-auto drop-shadow-lg"
                priority
                quality={90}
              />
              <div>
                <div className="text-2xl font-extrabold tracking-widest text-primary">AUF</div>
                <div className="text-xs uppercase tracking-[0.25em] text-gray-300">
                  Ali Usman Fatima
                </div>
              </div>
            </div>
          </Link>

          {/* User Name - Center */}
          {user && (
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
              <span className="text-sm text-gray-200 font-medium">Hi, {user.name}</span>
            </div>
          )}

          {/* Desktop Navigation - Right */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={
                isActive('/')
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-gray-200 hover:text-primary'
              }
            >
              Home
            </Link>
            <Link
              href="/cart"
              className={
                isActive('/cart')
                  ? 'text-primary border-b-2 border-primary pb-1 flex items-center'
                  : 'text-gray-200 hover:text-primary flex items-center'
              }
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5 min-w-[18px]">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/checkout"
              className={
                isActive('/checkout')
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-gray-200 hover:text-primary'
              }
            >
              Checkout
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => auth.logout?.()}
                className="text-gray-200 hover:text-primary text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className={
                  isAuthActive
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-gray-200 hover:text-primary'
                }
              >
                Account
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-200 hover:text-primary p-2"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary/20 pt-4 space-y-3">
            {user && (
              <div className="text-sm text-gray-200 font-medium pb-2 border-b border-primary/20">
                Hi, {user.name}
              </div>
            )}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded ${
                isActive('/')
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-gray-200 hover:bg-primary/10'
              }`}
            >
              Home
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded ${
                isActive('/cart')
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-gray-200 hover:bg-primary/10'
              }`}
            >
              <span className="flex items-center justify-between">
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-2 py-0.5 min-w-[20px]">
                    {cartCount}
                  </span>
                )}
              </span>
            </Link>
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 px-3 rounded ${
                isActive('/checkout')
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-gray-200 hover:bg-primary/10'
              }`}
            >
              Checkout
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  auth.logout?.();
                }}
                className="block w-full text-left py-2 px-3 rounded text-gray-200 hover:bg-primary/10"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded ${
                  isAuthActive
                    ? 'bg-primary/20 text-primary font-semibold'
                    : 'text-gray-200 hover:bg-primary/10'
                }`}
              >
                Account
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
