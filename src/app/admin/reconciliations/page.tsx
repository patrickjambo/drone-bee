'use client';

import { useState, useEffect } from 'react';
import { FileCheck, Search } from 'lucide-react';

export default function AdminReconciliations() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRecs = () => {
    fetch('/api/admin/reconciliations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecs(data.map(d => ({ ...d, actual_closing: d.actual_closing ?? d.expected_closing })));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecs();
    const interval = setInterval(fetchRecs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleActualChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setRecs(recs.map(r => r.product_id === productId ? { ...r, actual_closing: isNaN(num) ? 0 : num } : r));
  };

  const handleFinalize = async () => {
    if (!confirm('Are you sure you want to finalize today\'s reconciliation?')) return;
    setSaving(true);
    try {
      const payload = recs.map(r => ({
        product_id: r.product_id,
        actual_closing: r.actual_closing
      }));
      const res = await fetch('/api/admin/reconciliations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Reconciliations finalized successfully.');
      } else {
        alert('Failed to finalize.');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full">
      

      <div className="h-full w-full">
        
        <div className="h-full w-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Daily Reconciliations</h1>
            <p className="text-gray-500 font-medium">Review expected totals and post actual end-of-day counts.</p>
          </div>
          <button 
            onClick={handleFinalize} 
            disabled={loading || saving}
            className="bg-amber-500 hover:bg-[#3211b8] disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#4318FF]/20"
          >
            <FileCheck size={20} />
            {saving ? 'Finalizing...' : 'Finalize Reconciliations'}
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center p-12 text-gray-500">Loading today's logs...</div>
        ) : (
          <div className="bg-white rounded-[20px] shadow-sm border border-[#E9EDF7] overflow-hidden">
            <div className="p-6 border-b border-[#E9EDF7] flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Product Closings</h2>
              <div className="flex bg-[#F4F7FE] items-center px-4 py-2 rounded-xl">
                 <Search size={18} className="text-gray-500 mr-2" />
                 <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-gray-900 text-sm" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                  <tr>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">PRODUCT</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide text-right">OPENING EST.</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide text-right">SOLD TODAY</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide text-right">REQUIRED EXPECTED</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide text-right">ACTUAL COUNT</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide text-right">VARIANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {recs.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 px-6 text-center text-gray-500">No product records found.</td></tr>
                  ) : (
                    recs.map(r => {
                      const discrepancy = r.actual_closing - r.expected_closing;
                      return (
                        <tr key={r.product_id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">{r.name}</td>
                          <td className="py-4 px-6 font-medium text-gray-500 text-right">{r.opening_estimate}</td>
                          <td className="py-4 px-6 font-bold text-amber-500 text-right">{r.units_sold}</td>
                          <td className="py-4 px-6 font-bold text-gray-900 text-right bg-[#E9EDF7]/30">{r.expected_closing}</td>
                          <td className="py-4 px-6 text-right">
                            <input 
                              type="number" 
                              value={r.actual_closing}
                              onChange={(e) => handleActualChange(r.product_id, e.target.value)}
                              className="w-24 bg-[#F4F7FE] border-none rounded-xl px-4 py-2 text-right text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50"
                            />
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`px-3 py-1 rounded-lg font-bold text-sm ${discrepancy < 0 ? 'text-[#EE5D50] bg-[#EE5D50]/10' : discrepancy > 0 ? 'text-[#01B574] bg-[#01B574]/10' : 'text-gray-500 bg-[#A3AED0]/10'}`}>
                              {discrepancy > 0 ? '+' : ''}{discrepancy}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
