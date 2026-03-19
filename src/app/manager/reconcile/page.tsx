'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';


export default function ManagerReconciliation() {
  const [products, setProducts] = useState<any[]>([]);
  const [actualStock, setActualStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const initialStock: Record<string, number> = {};
        data.forEach((p: any) => {
          initialStock[p.id] = p.stock_units;
        });
        setActualStock(initialStock);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStockChange = (id: string, value: string) => {
    const numValue = parseInt(value, 10);
    setActualStock(prev => ({
      ...prev,
      [id]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to submit this reconciliation?')) return;
    
    setSubmitting(true);
    
    const items = products.map(p => ({
      productId: p.id,
      expectedStock: p.stock_units,
      actualStock: actualStock[p.id]
    }));

    try {
      const res = await fetch('/api/manager/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (res.ok) {
        alert('Daily Reconciliation submitted successfully.');
        router.push('/manager/dashboard');
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to submit reconciliation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full">
      

      <main className="ml-[260px] flex-1 p-8 overflow-y-auto">
        

        {loading ? (
          <div className="flex justify-center p-12 text-gray-400 font-medium">Loading inventory data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-[20px] shadow-sm border border-[#E9EDF7] overflow-hidden">
            <div className="p-6 border-b border-[#E9EDF7] bg-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1E2336]">Inventory Ledger</h2>
              <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[#1E2336] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <FileCheck size={18} />
                  {submitting ? 'Submitting...' : 'Submit EOD Count'}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-white border-b border-[#E9EDF7]">
                  <tr>
                    <th className="py-4 px-6 text-gray-400 font-bold text-sm tracking-wide">PRODUCT NAME</th>
                    <th className="py-4 px-6 text-gray-400 font-bold text-sm tracking-wide text-center">SYSTEM EXPECTED</th>
                    <th className="py-4 px-6 text-gray-400 font-bold text-sm tracking-wide text-center">ACTUAL PHYSICAL COUNT</th>
                    <th className="py-4 px-6 text-gray-400 font-bold text-sm tracking-wide text-right">DISCREPANCY</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => {
                    const discrepancy = (actualStock[p.id] || 0) - p.stock_units;
                    return (
                      <tr key={p.id} className="border-b border-[#E9EDF7] hover:bg-gray-50 transition-colors">
                        <td className="py-5 px-6">
                            <span className="font-bold text-[#1E2336] text-lg">{p.name}</span>
                        </td>
                        <td className="py-5 px-6 text-center">
                            <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold text-lg">
                                {p.stock_units}
                            </span>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <input 
                            type="number"
                            min="0"
                            className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 w-32 text-center text-[#1E2336] font-black text-xl focus:outline-none focus:border-[#FFC107] focus:ring-4 focus:ring-[#FFC107]/20 transition-all shadow-sm"
                            value={actualStock[p.id] ?? ''}
                            onChange={(e) => handleStockChange(p.id, e.target.value)}
                            required
                          />
                        </td>
                        <td className="py-5 px-6 text-right">
                          {discrepancy === 0 ? (
                             <span className="text-[#01B574] bg-[#01B574]/10 px-4 py-2 rounded-xl font-bold flex items-center justify-end gap-1 ml-auto w-fit">
                                <CheckCircle2 size={16} /> Matched
                             </span>
                          ) : (
                             <span className="text-[#EE5D50] bg-[#EE5D50]/10 px-4 py-2 rounded-xl font-bold font-mono text-lg inline-block">
                                {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                             </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                      <tr><td colSpan={4} className="py-8 px-6 text-center text-gray-400">No products found in system.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </form>
        )}
            </main>
  </div>
  );
}
