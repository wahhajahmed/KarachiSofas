import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Logo from '../../LOGO/LOGO.png';
import { useOrders } from '../context/OrdersContext';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Sidebar() {
  const router = useRouter();
  const { pendingCount } = useOrders();
  const { adminUser, logout } = useAdminAuth();

  const isActive = (path) => router.pathname === path;

  return (
    <aside className="w-64 bg-black/80 border-r border-primary/30 min-h-screen py-8 px-6">
      <div className="flex items-center space-x-3 mb-10">
        <Image src={Logo} alt="AUF Logo" className="h-10 w-auto" />
        <div>
          <p className="text-base font-bold tracking-widest text-primary">AUF</p>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Admin Panel</p>
        </div>
      </div>
      {adminUser && (
        <div className="mb-6 text-sm text-gray-200 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="font-semibold text-primary">{adminUser.name || adminUser.email}</p>
        </div>
      )}
      <nav className="space-y-2 text-base">
        <Link
          href="/"
          className={
            isActive('/') ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
          }
        >
          Dashboard
        </Link>
        <Link
          href="/products"
          className={
            isActive('/products') ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
          }
        >
          Products
        </Link>
        <Link
          href="/categories"
          className={
            isActive('/categories') ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
          }
        >
          Categories
        </Link>
        <Link
          href="/orders"
          className={
            isActive('/orders') ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
          }
        >
          <span>Orders</span>
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white px-2 py-1 min-w-[24px]">
              {pendingCount}
            </span>
          )}
        </Link>
        <Link
          href="/delivery-charges"
          className={
            isActive('/delivery-charges') ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
          }
        >
          Delivery Charges
        </Link>
      </nav>
      <div className="mt-10 text-sm text-gray-300 space-y-2 p-3 bg-secondary/40 rounded-lg border border-primary/20">
        <p className="text-sm font-semibold text-primary mb-2">Account</p>
        {adminUser ? (
          <>
            <p className="truncate">
              Signed in as {adminUser.name || adminUser.email}
            </p>
            <button
              type="button"
              onClick={logout}
              className="text-primary hover:text-primary-dark"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-primary hover:text-primary-dark mr-3">
              Login
            </Link>
            <Link href="/signup" className="text-primary hover:text-primary-dark">
              Signup
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
