'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileCheck, Search, Package, AlertTriangle, CheckCircle2, Wand2 } from 'lucide-react';

export default function AdminReconciliations() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchRecs = () => {
    fetch('/api/admin/reconciliations')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setRecs(data.map(d => ({ ...d, actual_closing: d.actual_closing ?? d.expected_closing }))); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecs(); const i = setInterval(fetchRecs, 12000); return () => clearInterval(i); }, []);

  const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const setActual = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setRecs(recs.map(r => r.product_id === productId ? { ...r, actual_closing: isNaN(num) ? 0 : num } : r));
  };

  const matchAll = () => setRecs(recs.map(r => ({ ...r, actual_closing: r.expected_closing })));

  const finalize = async () => {
    if (!confirm("Finalize today's reconciliation? Variances will be recorded.")) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/reconciliations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recs.map(r => ({ product_id: r.product_id, actual_closing: r.actual_closing }))),
      });
      if (res.ok) showToast('success', 'Reconciliation finalized.'); else showToast('error', 'Failed to finalize.');
    } catch { showToast('error', 'An error occurred.'); } finally { setSaving(false); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? recs.filter(r => r.name.toLowerCase().includes(q)) : recs;
  }, [recs, search]);

  const totalSold = recs.reduce((a, r) => a + (r.units_sold || 0), 0);
  const variances = recs.filter(r => (r.actual_closing - r.expected_closing) !== 0).length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2.5"><FileCheck className="text-amber-500" size={28} /> Daily Reconciliations</h1>
          <p className="text-gray-500 mt-1">Review expected stock vs. the physical end-of-day count and record variances.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={matchAll} className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E9EDF7] rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"><Wand2 size={16} /> Match all</button>
          <button onClick={finalize} disabled={loading || saving} className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25"><FileCheck size={18} /> {saving ? 'Finalizing…' : 'Finalize'}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Tile label="Products" value={recs.length} tint="bg-blue-50 text-blue-600" icon={Package} />
        <Tile label="Sold Today" value={totalSold.toLocaleString()} tint="bg-amber-50 text-amber-600" icon={CheckCircle2} />
        <Tile label="Variances" value={variances} tint={variances > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} icon={AlertTriangle} />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] overflow-hidden">
        <div className="p-5 border-b border-[#E9EDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Product Closings · {new Date().toLocaleDateString()}</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Loading today's logs…</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                <tr>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Product</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Opening est.</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Sold</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Expected</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Actual count</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Variance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 px-5 text-center text-gray-400">No product records found.</td></tr>
                ) : filtered.map(r => {
                  const variance = r.actual_closing - r.expected_closing;
                  return (
                    <tr key={r.product_id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/60 transition-colors">
                      <td className="py-4 px-5 font-bold text-gray-900 whitespace-nowrap">{r.name}</td>
                      <td className="py-4 px-5 font-medium text-gray-400 text-right">{r.opening_estimate}</td>
                      <td className="py-4 px-5 font-bold text-amber-600 text-right">{r.units_sold}</td>
                      <td className="py-4 px-5 font-bold text-gray-900 text-right bg-[#F4F7FE]/60">{r.expected_closing}</td>
                      <td className="py-4 px-5 text-right">
                        <input type="number" value={r.actual_closing} onChange={e => setActual(r.product_id, e.target.value)}
                          className="w-24 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3 py-2 text-right text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className={`px-3 py-1 rounded-lg font-bold text-sm ${variance < 0 ? 'text-red-600 bg-red-50' : variance > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 bg-gray-100'}`}>
                          {variance > 0 ? '+' : ''}{variance}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-4 z-[60] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-bold text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}{toast.msg}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, tint, icon: Icon }: { label: string; value: any; tint: string; icon: any }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${tint}`}><Icon size={16} /></div>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
