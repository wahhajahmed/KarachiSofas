import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Logo from '../../LOGO/LOGO.png';
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
      <div className="container-max flex items-center justify-between py-4">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              {/* AUF Logo - loaded from shared LOGO folder */}
              <Image
                src={Logo}
                alt="AUF Karachi Sofas Logo"
                className="h-10 w-auto drop-shadow-lg"
              />
              <div>
                <div className="text-2xl font-extrabold tracking-widest text-primary">AUF</div>
                <div className="text-xs uppercase tracking-[0.25em] text-gray-300">
                  Ali Usman Fatima
                </div>
              </div>
            </div>
          </Link>
          {user && (
            <span className="text-xs text-gray-300 hidden sm:inline">Hi, {user.name}</span>
          )}
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium">
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
            <>
              <button
                type="button"
                onClick={() => auth.logout?.()}
                className="text-gray-200 hover:text-primary text-xs"
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
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-gray-200 hover:text-primary'
                }
              >
                Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
