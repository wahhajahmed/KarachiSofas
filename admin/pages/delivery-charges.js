import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';

export default function DeliveryChargesPage() {
  const [charges, setCharges] = useState([]);
  const [area, setArea] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  async function fetchDeliveryCharges() {
    setLoading(true);
    const { data, error } = await supabase
      .from('delivery_charges')
      .select('*')
      .order('area', { ascending: true });

    if (error) {
      console.error('Error fetching delivery charges:', error);
      setMessage('Failed to load delivery charges');
    } else {
      setCharges(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (!area.trim()) {
      setMessage('Area name is required');
      return;
    }

    if (!amount || Number(amount) < 0) {
      setMessage('Valid delivery charges amount is required');
      return;
    }

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from('delivery_charges')
        .update({
          area: area.trim(),
          charges: Number(amount),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating:', error);
        setMessage('Failed to update delivery charges');
      } else {
        setMessage('✓ Delivery charges updated successfully!');
        setArea('');
        setAmount('');
        setEditingId(null);
        fetchDeliveryCharges();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('delivery_charges')
        .insert({
          area: area.trim(),
          charges: Number(amount),
        });

      if (error) {
        if (error.code === '23505') {
          setMessage('This area already exists. Please update it instead.');
        } else {
          console.error('Error creating:', error);
          setMessage('Failed to add delivery charges');
        }
      } else {
        setMessage('✓ Delivery charges added successfully!');
        setArea('');
        setAmount('');
        fetchDeliveryCharges();
      }
    }
  }

  function handleEdit(charge) {
    setArea(charge.area);
    setAmount(charge.charges);
    setEditingId(charge.id);
    setMessage('');
  }

  function handleCancelEdit() {
    setArea('');
    setAmount('');
    setEditingId(null);
    setMessage('');
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this delivery charge?')) {
      return;
    }

    const { error } = await supabase
      .from('delivery_charges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting:', error);
      setMessage('Failed to delete delivery charges');
    } else {
      setMessage('✓ Delivery charges deleted successfully!');
      fetchDeliveryCharges();
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-secondary via-secondary to-black text-base-content">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Delivery Charges Management</h1>

          {/* Add/Edit Form */}
          <div className="card p-6 mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              {editingId ? 'Edit Delivery Charge' : 'Add New Delivery Charge'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Area / City Name
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Gulshan-e-Iqbal"
                    className="w-full rounded-md bg-black/40 border border-primary/40 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delivery Charges (Rs)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500"
                    min="0"
                    step="1"
                    className="w-full rounded-md bg-black/40 border border-primary/40 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    message.startsWith('✓')
                      ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Add'} Delivery Charge
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Delivery Charges List */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">Delivery Charges List</h2>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : charges.length === 0 ? (
              <p className="text-gray-400">No delivery charges configured yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/40">
                      <th className="text-left py-3 px-4 text-primary font-semibold">Area / City</th>
                      <th className="text-left py-3 px-4 text-primary font-semibold">Charges (Rs)</th>
                      <th className="text-right py-3 px-4 text-primary font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charges.map((charge) => (
                      <tr key={charge.id} className="border-b border-primary/20 hover:bg-primary/5">
                        <td className="py-3 px-4 font-medium">{charge.area}</td>
                        <td className="py-3 px-4">Rs {Number(charge.charges).toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleEdit(charge)}
                            className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(charge.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
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
