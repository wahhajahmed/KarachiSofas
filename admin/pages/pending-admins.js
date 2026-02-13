import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function PendingAdminsPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!adminUser) {
      router.push('/login');
      return;
    }
    fetchPendingAdmins();
  }, [adminUser, router]);

  async function fetchPendingAdmins() {
    try {
      const { data, error } = await supabase
        .from('pending_admins')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAdmins(data || []);
    } catch (error) {
      console.error('Error fetching pending admins:', error);
      setMessage('Failed to load pending admin requests.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(pending) {
    try {
      setMessage('');
      
      // Create admin account in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          name: pending.name,
          email: pending.email,
          password: pending.password,
          phone: pending.phone,
          role: 'admin',
          approved: true,
          approved_by: adminUser.id
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setMessage('This email already exists in the system.');
          return;
        }
        throw insertError;
      }

      // Update pending admin status
      const { error: updateError } = await supabase
        .from('pending_admins')
        .update({
          status: 'approved',
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', pending.id);

      if (updateError) throw updateError;

      setMessage(`✓ Admin account for ${pending.name} has been approved.`);
      fetchPendingAdmins(); // Refresh list
    } catch (error) {
      console.error('Error approving admin:', error);
      setMessage(`Failed to approve admin: ${error.message}`);
    }
  }

  async function handleReject(pending) {
    try {
      setMessage('');
      
      const { error } = await supabase
        .from('pending_admins')
        .update({
          status: 'rejected',
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', pending.id);

      if (error) throw error;

      setMessage(`Admin request from ${pending.name} has been rejected.`);
      fetchPendingAdmins(); // Refresh list
    } catch (error) {
      console.error('Error rejecting admin:', error);
      setMessage(`Failed to reject admin: ${error.message}`);
    }
  }

  if (!adminUser) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Pending Admin Approvals</h1>
      
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.startsWith('✓') 
            ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : pendingAdmins.length === 0 ? (
        <div className="bg-secondary/60 border border-primary/40 rounded-xl p-8 text-center">
          <p className="text-gray-400">No pending admin requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAdmins.map((pending) => (
            <div
              key={pending.id}
              className="bg-secondary/60 border border-primary/40 rounded-xl p-6 hover:border-primary/60 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary mb-2">{pending.name}</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><span className="font-medium">Email:</span> {pending.email}</p>
                    {pending.phone && <p><span className="font-medium">Phone:</span> {pending.phone}</p>}
                    <p><span className="font-medium">Requested:</span> {new Date(pending.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(pending)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(pending)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
