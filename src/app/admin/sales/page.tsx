'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Download, Ban, AlertTriangle, CheckCircle2, Banknote, Flag } from 'lucide-react';

const STATUS_TABS = ['All', 'CONFIRMED', 'flagged', 'VOIDED'] as const;
const TAB_LABEL: Record<string, string> = { All: 'All', CONFIRMED: 'Confirmed', flagged: 'Flagged', VOIDED: 'Voided' };

export default function AdminSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<string>('All');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchSales = () => {
    const qs = tab === 'All' ? '' : `?status=${tab}`;
    fetch(`/api/admin/sales${qs}`).then(r => r.ok ? r.json() : []).then(d => { if (Array.isArray(d)) setSales(d); }).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchSales(); const i = setInterval(fetchSales, 12000); return () => clearInterval(i); }, [tab]);

  const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const voidSale = async (id: string) => {
    if (!confirm('Void this sale? The stock will be returned to inventory. This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/sales/${id}/void`, { method: 'POST' });
      if (res.ok) { const d = await res.json(); showToast('success', `Sale voided · ${d.restored} units restored.`); fetchSales(); }
      else { const d = await res.json().catch(() => ({})); showToast('error', d.error || 'Failed to void.'); }
    } catch { showToast('error', 'Error voiding sale.'); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter(s => (s.product?.name || '').toLowerCase().includes(q) || (s.manager?.full_name || '').toLowerCase().includes(q));
  }, [sales, search]);

  const revenue = sales.filter(s => s.status !== 'VOIDED').reduce((a, s) => a + s.total_amount, 0);
  const flaggedCount = sales.filter(s => s.flagged && s.status !== 'VOIDED').length;
  const voidedCount = sales.filter(s => s.status === 'VOIDED').length;

  const exportCsv = () => {
    let csv = 'data:text/csv;charset=utf-8,Time,Product,Agent,Qty,Type,Total RWF,Status\n';
    filtered.forEach(s => { csv += `"${new Date(s.created_at).toLocaleString()}","${s.product?.name || ''}","${s.manager?.full_name || ''}",${s.quantity},${s.sale_type},${s.total_amount},${s.status}\n`; });
    const link = document.createElement('a'); link.setAttribute('href', encodeURI(csv)); link.setAttribute('download', `sales-${tab}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2.5"><ShoppingCart className="text-amber-500" size={28} /> Sales Ledger</h1>
          <p className="text-gray-500 mt-1">Review every transaction, investigate flagged sales, and void mistakes.</p>
        </div>
        <button onClick={exportCsv} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25"><Download size={16} /> Export CSV</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile label="Shown" value={sales.length} tint="bg-blue-50 text-blue-600" icon={ShoppingCart} />
        <Tile label="Net Revenue" value={`RWF ${revenue.toLocaleString()}`} tint="bg-emerald-50 text-emerald-600" icon={Banknote} />
        <Tile label="Flagged" value={flaggedCount} tint="bg-amber-50 text-amber-600" icon={Flag} />
        <Tile label="Voided" value={voidedCount} tint="bg-red-50 text-red-600" icon={Ban} />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] overflow-hidden">
        <div className="p-5 border-b border-[#E9EDF7] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex gap-2">
            {STATUS_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${tab === t ? 'bg-[#1E2336] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{TAB_LABEL[t]}</button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product or agent…" className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Loading sales…</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                <tr>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Time</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Product</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Agent</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Qty</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Total</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 px-5 text-center text-gray-400">No sales found.</td></tr>
                ) : filtered.map(s => {
                  const voided = s.status === 'VOIDED';
                  return (
                    <tr key={s.id} className={`border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/60 transition-colors ${voided ? 'opacity-60' : s.flagged ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-4 px-5 text-sm text-gray-500 whitespace-nowrap">{new Date(s.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-4 px-5 font-bold text-gray-900">{s.product?.name || 'Product'} {s.flagged && !voided && <span title={s.flag_reason || 'Flagged'} className="text-amber-500">⚑</span>}</td>
                      <td className="py-4 px-5 text-gray-700">{s.manager?.full_name || 'Agent'}</td>
                      <td className="py-4 px-5 text-gray-700">{s.quantity} <span className="text-xs text-gray-400">{s.sale_type}</span></td>
                      <td className={`py-4 px-5 text-right font-black ${voided ? 'text-gray-400 line-through' : 'text-gray-900'}`}>RWF {s.total_amount.toLocaleString()}</td>
                      <td className="py-4 px-5">
                        {voided ? <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">Voided</span>
                          : s.flagged ? <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">Flagged</span>
                          : <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Confirmed</span>}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {!voided && <button onClick={() => voidSale(s.id)} className="text-gray-400 hover:text-red-500 transition inline-flex items-center gap-1 text-sm font-bold" title="Void & restore stock"><Ban size={15} /> Void</button>}
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
