import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUser) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [adminUser, router]);

  async function loadDashboardData() {
    setLoading(true);
    const { data: cats } = await supabase
      .from('categories')
      .select('*')
      .order('created_at');

    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: ords } = await supabase
      .from('orders')
      .select('*, products(*), users(*)')
      .order('created_at', { ascending: false })
      .limit(10);

    setCategories(cats || []);
    setProducts(prods || []);
    setOrders(ords || []);
    setLoading(false);
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64 pt-16 md:pt-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Welcome, {adminUser.name}
            </h1>
            <p className="text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">
              Manage your AUF Karachi Sofas store from this dashboard
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <div className="text-sm text-gray-400 mb-2">Total Categories</div>
              <div className="text-3xl font-bold text-primary">{categories.length}</div>
            </div>
            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <div className="text-sm text-gray-400 mb-2">Total Products</div>
              <div className="text-3xl font-bold text-primary">{products.length}</div>
            </div>
            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <div className="text-sm text-gray-400 mb-2">Pending Orders</div>
              <div className="text-3xl font-bold text-primary">
                {orders.filter(o => o.status === 'pending').length}
              </div>
            </div>
            <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
              <div className="text-sm text-gray-400 mb-2">Total Orders</div>
              <div className="text-3xl font-bold text-primary">{orders.length}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
            <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Link href="/products" className="btn-primary text-center text-sm md:text-base">
                Add Product
              </Link>
              <Link href="/categories" className="btn-primary text-center text-sm md:text-base">
                Manage Categories
              </Link>
              <Link href="/orders" className="btn-primary text-center text-sm md:text-base">
                View Orders
              </Link>
              <Link href="/delivery-charges" className="btn-primary text-center text-sm md:text-base">
                Delivery Charges
              </Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
            <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/40">
                      <th className="text-left py-3 px-2 text-gray-300 font-medium">Customer</th>
                      <th className="text-left py-3 px-2 text-gray-300 font-medium hidden md:table-cell">Product</th>
                      <th className="text-right py-3 px-2 text-gray-300 font-medium">Amount</th>
                      <th className="text-center py-3 px-2 text-gray-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-primary/20 hover:bg-primary/10">
                        <td className="py-3 px-2 text-white">{order.users?.name || 'N/A'}</td>
                        <td className="py-3 px-2 text-gray-300 hidden md:table-cell">
                          {order.products?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-2 text-right text-primary font-semibold">
                          Rs {Number(order.total_price).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : order.status === 'completed'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
