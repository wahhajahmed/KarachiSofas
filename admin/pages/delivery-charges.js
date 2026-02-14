import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Sidebar from '../components/Sidebar';
import { karachiAreas } from '../lib/karachiAreas';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useRouter } from 'next/router';

export default function DeliveryChargesPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [existingCharges, setExistingCharges] = useState([]);
  const [savedBlocks, setSavedBlocks] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!adminUser) {
      router.push('/login');
    } else {
      fetchExistingCharges();
    }
  }, [adminUser, router]);

  async function fetchExistingCharges() {
    const { data } = await supabase
      .from('delivery_charges')
      .select('*')
      .order('area', { ascending: true });
    
    if (data) {
      setExistingCharges(data);
      // Store the full area names (e.g., "Abbas Town - Sector 1")
      const saved = new Set(data.map(item => item.area));
      setSavedBlocks(saved);
    }
  }

  const currentArea = karachiAreas.find(a => a.name === selectedArea);
  const availableBlocks = currentArea?.blocks || [];

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (!selectedArea || !selectedBlock || !amount) {
      setMessage('Please select area, block, and enter delivery charges');
      return;
    }

    if (Number(amount) < 0) {
      setMessage('Delivery charges must be a positive number');
      return;
    }

    setLoading(true);
    const fullAreaName = `${selectedArea} - ${selectedBlock}`;

    const { error } = await supabase
      .from('delivery_charges')
      .insert({
        area: fullAreaName,
        charges: Number(amount),
      });

    if (error) {
      if (error.code === '23505') {
        setMessage('Delivery charges for this block already exist');
      } else {
        setMessage('Failed to save delivery charges');
      }
    } else {
      setMessage('✓ Delivery charges saved successfully!');
      setSelectedArea('');
      setSelectedBlock('');
      setAmount('');
      await fetchExistingCharges();
    }
    setLoading(false);
  }

  async function handleDelete(id, area) {
    if (!confirm(`Delete delivery charges for ${area}?`)) return;

    const { error } = await supabase
      .from('delivery_charges')
      .delete()
      .eq('id', id);

    if (error) {
      setMessage('Failed to delete delivery charges');
    } else {
      setMessage('✓ Delivery charges deleted');
      await fetchExistingCharges();
    }
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-secondary to-black">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64 pt-16 md:pt-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">
            Manage Delivery Charges
          </h1>

          {/* Add New Delivery Charges */}
          <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-primary mb-4">Add Delivery Charges</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Area
                  </label>
                  <select
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setSelectedBlock('');
                    }}
                    className="w-full rounded-lg bg-black/60 border-2 border-primary/50 px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-white transition-all"
                    required
                  >
                    <option value="" className="bg-secondary text-gray-400">Choose Area...</option>
                    {karachiAreas.map((area) => (
                      <option key={area.name} value={area.name} className="bg-secondary text-white font-medium py-2">
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Block/Sector
                  </label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    className="w-full rounded-lg bg-black/60 border-2 border-primary/50 px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-white transition-all"
                    required
                    disabled={!selectedArea}
                  >
                    <option value="" className="bg-secondary text-gray-400">
                      {selectedArea ? 'Choose Block...' : 'Select Area First'}
                    </option>
                    {availableBlocks.map((block) => (
                      <option key={block} value={block} className="bg-secondary text-white font-medium py-2">
                        {block}
                      </option>
                    ))}
                  </select>
                  {selectedArea && availableBlocks.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No blocks available for this area
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delivery Charges (Rs)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 200"
                    min="0"
                    className="w-full rounded-md bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    required
                  />
                </div>
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${
                  message.startsWith('✓') 
                    ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedArea || !selectedBlock || !amount}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Delivery Charges'}
              </button>
            </form>
          </div>

          {/* Existing Delivery Charges */}
          <div className="bg-secondary/70 border border-primary/40 rounded-xl p-4 md:p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-primary mb-4">Configured Delivery Charges</h2>
            
            {existingCharges.length === 0 ? (
              <p className="text-gray-400 text-sm">No delivery charges configured yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/40">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Area - Block</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Charges (Rs)</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingCharges.map((charge) => (
                      <tr key={charge.id} className="border-b border-primary/20 hover:bg-primary/10">
                        <td className="py-3 px-4 text-white">{charge.area}</td>
                        <td className="py-3 px-4 text-right text-primary font-semibold">
                          Rs {Number(charge.charges).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(charge.id, charge.area)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium"
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
