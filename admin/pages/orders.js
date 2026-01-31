import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import OrderList from '../components/OrderList';
import { useOrders } from '../context/OrdersContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const { setPendingCount } = useOrders();

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

  useEffect(() => {
    load();
  }, []);

  async function handleUpdateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-primary">
        Orders{orders.length ? ` (${orders.length})` : ''}
      </h1>
      <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
}
