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
    <aside className="w-56 bg-black/70 border-r border-primary/30 min-h-screen py-6 px-4">
      <div className="flex items-center space-x-2 mb-8">
        <Image src={Logo} alt="AUF Logo" className="h-8 w-auto" />
        <div>
          <p className="text-sm font-bold tracking-widest text-primary">AUF</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Admin Panel</p>
        </div>
      </div>
      {adminUser && (
        <div className="mb-4 text-[11px] text-gray-200">
          <p className="font-semibold text-primary">{adminUser.name || adminUser.email}</p>
        </div>
      )}
      <nav className="space-y-1 text-sm">
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
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5 min-w-[18px]">
              {pendingCount}
            </span>
          )}
        </Link>
      </nav>
      <div className="mt-8 text-[11px] text-gray-300 space-y-1">
        <p className="text-[11px] font-semibold text-primary mb-1">Account</p>
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
