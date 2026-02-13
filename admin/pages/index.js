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
                  <h3 className="text-xl font-bold text-primary mb-2">{c.name}</h3>
                  <p className="text-sm text-gray-300">
                    Click to manage this category and its products.
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Products grouped by category, similar to storefront sections */}
      <section className="space-y-8">
        {loading && !products.length && (
          <p className="text-base text-gray-300">Loading products…</p>
        )}
        {!loading && !products.length && (
          <p className="text-base text-gray-300">No products yet. Add products to see the preview.</p>
        )}

        {categories.map((category) => {
          const items = products.filter((p) => p.category_id === category.id);
          if (!items.length) return null;
          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-primary">
                  {category.name} <span className="text-sm text-gray-400">(Admin preview)</span>
                </h3>
                <span className="text-sm text-gray-400">{items.length} product(s)</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="card overflow-hidden flex flex-col"
                  >
                    <div className="relative h-52 bg-gradient-to-br from-black via-secondary to-primary/30">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-base">
                          AUF Sofa Image
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-lg font-bold mb-2">{product.name}</h4>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-primary font-bold text-xl">
                          Rs {Number(product.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">Preview only</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
