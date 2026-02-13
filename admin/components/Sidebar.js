import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../LOGO/LOGO.png';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useOrders } from '../context/OrdersContext';

export default function Sidebar() {
  const router = useRouter();
  const { adminUser, logout } = useAdminAuth();
  const { pendingCount } = useOrders();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/categories', label: 'Categories' },
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'Orders', badge: pendingCount },
    { href: '/delivery-charges', label: 'Delivery Charges' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-secondary border border-primary/40 rounded-lg"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className="block h-0.5 w-full bg-primary"></span>
          <span className="block h-0.5 w-full bg-primary"></span>
          <span className="block h-0.5 w-full bg-primary"></span>
        </div>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:fixed top-0 left-0 h-full w-64 bg-secondary border-r border-primary/40 z-40
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Image src={Logo} alt="AUF Logo" className="h-10 w-auto" />
            <div>
              <p className="text-base font-bold tracking-widest text-primary">AUF</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Admin Panel</p>
            </div>
          </div>

          {adminUser && (
            <div className="mb-6 text-sm text-gray-200 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="font-semibold text-primary truncate">{adminUser.name || adminUser.email}</p>
            </div>
          )}

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between py-2 px-4 rounded transition-colors ${
                  router.pathname === link.href
                    ? 'bg-primary/30 text-primary font-semibold'
                    : 'hover:bg-primary/20 text-white'
                }`}
              >
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white px-2 py-1 min-w-[24px]">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 rounded hover:bg-red-500/20 text-red-300 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}

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
