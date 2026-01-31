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
    <header className="bg-secondary/95 border-b border-primary/40 sticky top-0 z-20 backdrop-blur-lg shadow-lg">
      <div className="container-max flex items-center justify-between py-5">
        <div className="flex items-center space-x-8">
          <Link href="/">
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
            <span className="text-sm text-gray-300 hidden md:inline">Hi, {user.name}</span>
          )}
        </div>
        <nav className="flex items-center space-x-8 text-base font-medium">
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
            className={
              isActive('/cart')
                ? 'text-primary border-b-2 border-primary pb-1 flex items-center transition-colors'
                : 'text-gray-200 hover:text-primary flex items-center transition-colors'
            }
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white px-2 py-1 min-w-[24px]">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            href="/checkout"
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
          )}
        </nav>
      </div>
    </header>
  );
}
