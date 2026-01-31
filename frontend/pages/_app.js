import '../styles/globals.css';
import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Simple cart context for frontend only
const CartContext = createContext();
const AuthContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload || [];
    case 'ADD': {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
        // Item already in cart – keep quantity as-is; user can change it from the cart page
        return state;
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case 'INCREASE':
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    case 'DECREASE':
      return state
        .map((item) =>
          item.id === action.id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0);
    case 'REMOVE':
      return state.filter((item) => item.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function useCart() {
  return useContext(CartContext);
}

export function useAuth() {
  return useContext(AuthContext);
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [user, setUser] = useState(null);
  
  // Check if current page is login/signup/forgot-password
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(router.pathname);

  // Persist cart to localStorage for simple UX
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('auf-cart');
    if (stored) {
      try {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(stored) });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('auf-cart', JSON.stringify(cart));
  }, [cart]);

  // Restore logged-in user if they did not log out
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('auf-user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const setAndPersistUser = (nextUser) => {
    setUser(nextUser);
    if (typeof window !== 'undefined') {
      if (nextUser) {
        window.localStorage.setItem('auf-user', JSON.stringify(nextUser));
      } else {
        window.localStorage.removeItem('auf-user');
      }
    }
  };

  const value = {
    cart,
    addToCart: (product) => dispatch({ type: 'ADD', payload: product }),
    removeFromCart: (id) => dispatch({ type: 'REMOVE', id }),
    increaseQty: (id) => dispatch({ type: 'INCREASE', id }),
    decreaseQty: (id) => dispatch({ type: 'DECREASE', id }),
    clearCart: () => dispatch({ type: 'CLEAR' }),
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setAndPersistUser, logout: () => setAndPersistUser(null) }}>
      <CartContext.Provider value={value}>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-secondary to-black">
          {!isAuthPage && <Header />}
          <main className={isAuthPage ? "flex-1 flex items-center justify-center py-12" : "flex-1 container-max py-8"}>
            <Component {...pageProps} />
          </main>
          {!isAuthPage && <Footer />}
        </div>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default MyApp;
