import '../styles/globals.css';
import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabaseClient';

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

  // Remove localStorage cart persistence since we're using database now
  // (Old code removed)


  // Restore logged-in user from Supabase session and load their cart
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user data from users table
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data);
              loadUserCart(data.id);
            } else {
              setUser(session.user);
              loadUserCart(session.user.id);
            }
          });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data);
              loadUserCart(data.id);
            } else {
              setUser(session.user);
              loadUserCart(session.user.id);
            }
          });
      } else {
        setUser(null);
        dispatch({ type: 'CLEAR' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user's cart from database
  const loadUserCart = async (userId) => {
    if (!userId) return;
    
    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products:product_id (
            id,
            name,
            description,
            price,
            image_url,
            category_id
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading cart:', error);
        return;
      }

      if (cartItems && cartItems.length > 0) {
        const formattedCart = cartItems
          .filter(item => item.products) // Filter out items with null products
          .map(item => ({
            id: item.products.id,
            name: item.products.name,
            description: item.products.description,
            price: item.products.price,
            image_url: item.products.image_url,
            category_id: item.products.category_id,
            quantity: item.quantity,
            cartItemId: item.id
          }));
        dispatch({ type: 'HYDRATE', payload: formattedCart });
      }
    } catch (err) {
      console.error('Error in loadUserCart:', err);
    }
  };

  const setAndPersistUser = (nextUser) => {
    setUser(nextUser);
    // No need for localStorage - Supabase handles session persistence
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    dispatch({ type: 'CLEAR' });
    router.push('/');
  };

  // Add item to cart (database + state)
  const addToCart = async (product) => {
    if (!user) {
      // Save pending item and redirect to login
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('auf-pending-cart-item', JSON.stringify(product));
      }
      router.push('/login');
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        // Item already in cart - show alert
        alert('This item is already in your cart!');
        return;
      }

      // Add to database
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1
        });

      if (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
        return;
      }

      // Update local state
      dispatch({ type: 'ADD', payload: { ...product, quantity: 1 } });
      alert('Item added to cart successfully!');
    } catch (err) {
      console.error('Error in addToCart:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Increase quantity
  const increaseQty = async (productId) => {
    if (!user) return;

    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;

    await supabase
      .from('cart_items')
      .update({ quantity: cartItem.quantity + 1, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    dispatch({ type: 'INCREASE', id: productId });
  };

  // Decrease quantity
  const decreaseQty = async (productId) => {
    if (!user) return;

    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;

    if (cartItem.quantity <= 1) {
      // Remove from database
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      // Decrease quantity
      await supabase
        .from('cart_items')
        .update({ quantity: cartItem.quantity - 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }

    dispatch({ type: 'DECREASE', id: productId });
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!user) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    dispatch({ type: 'REMOVE', id: productId });
  };

  // Clear cart
  const clearCart = async () => {
    if (!user) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    dispatch({ type: 'CLEAR' });
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setAndPersistUser, logout }}>
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
