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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const handleCheckoutClick = (e) => {
    if (!user) {
      e.preventDefault();
      router.push('/login');
    }
  };

  return (
    <header className="bg-secondary/95 border-b border-primary/40 sticky top-0 z-20 backdrop-blur-lg shadow-lg">
      <div className="container-max flex items-center justify-between py-5">
        <div className="flex items-center space-x-8">
          <Link href="/" onClick={closeMobileMenu}>
            <div className="flex items-center space-x-4 cursor-pointer group">
              {/* AUF Logo */}
              <Image
                src="/logo.png"
                alt="AUF Karachi Sofas Logo"
                width={56}
                height={56}
                className="h-14 w-auto drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
              />
              <div>
                <div className="text-3xl font-extrabold tracking-widest text-primary">AUF</div>
                <div className="text-sm uppercase tracking-[0.25em] text-gray-300">
                  Ali Usman Fatima
                </div>
              </div>
            </div>
          </Link>
          {user && (
            <span className="text-base text-primary font-medium hidden md:inline">
              Welcome, {user.name || user.email}
            </span>
          )}
        </div>

        {/* Hamburger Button - Mobile Only */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex flex-col space-y-1.5 p-2 z-50 relative"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-primary transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-primary transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-primary transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-base font-medium">
          <Link
            href="/"
            className={
              isActive('/')
                ? 'text-primary border-b-2 border-primary pb-1 transition-colors'
                : 'text-gray-200 hover:text-primary transition-colors'
            }
          >
            Home
          </Link>
          <Link
            href="/cart"
            onClick={handleCartClick}
            className={
              isActive('/cart')
                ? 'text-primary border-b-2 border-primary pb-1 flex items-center transition-colors'
                : 'text-gray-200 hover:text-primary flex items-center transition-colors'
            }
          >
            <span>Cart</span>
            {user && cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white px-2 py-1 min-w-[24px]">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/checkout"
            onClick={handleCheckoutClick}
            className={
              isActive('/checkout')
                ? 'text-primary border-b-2 border-primary pb-1 transition-colors'
                : 'text-gray-200 hover:text-primary transition-colors'
            }
          >
            Checkout
          </Link>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => auth.logout?.()}
                className="text-gray-200 hover:text-primary text-sm transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={
                  isAuthActive
                    ? 'text-primary border-b-2 border-primary pb-1 transition-colors'
                    : 'text-gray-200 hover:text-primary transition-colors'
                }
              >
                Account
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation Menu */}
        <div
          className={`lg:hidden fixed inset-0 bg-[#0a0a0a] z-50 transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          {/* Close button */}
          <button
            onClick={closeMobileMenu}
            className="absolute top-6 right-6 text-primary hover:text-primary-dark"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav
            className={`flex flex-col items-center justify-center h-full space-y-8 px-8 transition-transform duration-300 ${
              mobileMenuOpen ? 'scale-100' : 'scale-95'
            }`}
          >
            {/* Logo Section */}
            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold tracking-widest text-primary">AUF</div>
              <div className="text-xs uppercase tracking-[0.3em] text-gray-400 mt-1">
                Ali Usman Fatima
              </div>
            </div>

            {/* User Welcome */}
            {user && (
              <div className="text-center pb-4 border-b border-primary/30 w-full">
                <span className="text-base text-primary font-medium">Welcome, {user.name || user.email}</span>
              </div>
            )}

            {/* Navigation Links */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="text-xl text-gray-200 hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            
            <Link
              href="/cart"
              onClick={(e) => {
                handleCartClick(e);
                closeMobileMenu();
              }}
              className="text-xl text-gray-200 hover:text-primary transition-colors font-medium flex items-center gap-3"
            >
              <span>Cart</span>
              {user && cartCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white px-3 py-1 min-w-[32px]">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <Link
              href="/checkout"
              onClick={(e) => {
                handleCheckoutClick(e);
                closeMobileMenu();
              }}
              className="text-xl text-gray-200 hover:text-primary transition-colors font-medium"
            >
              Checkout
            </Link>

            {/* Auth Section */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  auth.logout?.();
                  closeMobileMenu();
                }}
                className="mt-8 bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-secondary transition-all px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="mt-8 bg-primary text-secondary hover:bg-primary-dark transition-all px-8 py-3 rounded-lg font-semibold text-lg"
              >
                Login / Sign Up
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
