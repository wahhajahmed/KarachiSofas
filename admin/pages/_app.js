import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import { OrdersContext } from '../context/OrdersContext';
import { AdminAuthContext } from '../context/AdminAuthContext';

export default function AdminApp({ Component, pageProps }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [adminUser, setAdminUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  // Restore admin session from localStorage (stay logged in until explicit logout)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('auf-admin-user');
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setHydrated(true);
  }, []);

  const handleSetAdminUser = (user) => {
    setAdminUser(user);
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.setItem('auf-admin-user', JSON.stringify(user));
      } else {
        window.localStorage.removeItem('auf-admin-user');
      }
    }
  };

  const logout = () => handleSetAdminUser(null);

  // Simple route protection: require admin login for all pages except login/signup
  useEffect(() => {
    if (!hydrated) return;
    const path = router.pathname;
    const isAuthRoute = path === '/login' || path === '/signup';

    if (!adminUser && !isAuthRoute) {
      router.replace('/login');
    } else if (adminUser && isAuthRoute) {
      router.replace('/');
    }
  }, [adminUser, hydrated, router]);

  return (
    <AdminAuthContext.Provider value={{ adminUser, setAdminUser: handleSetAdminUser, logout }}>
      <OrdersContext.Provider value={{ pendingCount, setPendingCount }}>
        {/* Layout is handled by each page component */}
        {(!hydrated || adminUser || router.pathname === '/login' || router.pathname === '/signup') && (
          <Component {...pageProps} />
        )}
      </OrdersContext.Provider>
    </AdminAuthContext.Provider>
  );
}
