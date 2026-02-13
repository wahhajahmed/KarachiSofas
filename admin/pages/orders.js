import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';
import Sidebar from '../components/Sidebar';
import OrderList from '../components/OrderList';
import { useOrders } from '../context/OrdersContext';

export default function OrdersPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const { setPendingCount } = useOrders();

  useEffect(() => {
    if (!adminUser) {
      router.push('/login');
      return;
    }
    load();
  }, [adminUser, router]);

  async function load() {
    const { data } = await supabase
      .from('orders')
      .select('*, products(*), users(*)')
      .order('created_at', { ascending: false });
    const list = data || [];
    const pendingOrders = list.filter((o) => o.status === 'pending');
    setOrders(pendingOrders);
    setPendingCount(pendingOrders.length);
  }

  async function handleUpdateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) load();
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
            <h1 className="text-xl md:text-2xl font-semibold text-primary mb-4">
              Orders{orders.length ? ` (${orders.length})` : ''}
            </h1>
            <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
          </div>
        </div>
      </main>
    </div>
  );
}
