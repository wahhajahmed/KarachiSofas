import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCart, useAuth } from '../pages/_app';

export default function Header() {
  const router = useRouter();
  const { cart } = useCart() || { cart: [] };
  const auth = useAuth() || {};
  const user = auth.user;

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

          {/* Navigation - Right */}
          <nav className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
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
        </div>
      </div>
    </header>
  );
}
