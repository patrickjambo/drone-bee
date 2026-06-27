'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Package, BellRing, Download, Plus, Banknote, TrendingUp,
  AlertTriangle, ShoppingCart, UserPlus, PackagePlus, ArrowUpRight, CheckCircle2, ShieldAlert, Ban,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalRevenue: 0, unitsSold: 0, activeManagers: 0, unreadAlertsCount: 0 });
  const [sales, setSales] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [agentName, setAgentName] = useState('');
  const [agentPass, setAgentPass] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [restockQty, setRestockQty] = useState(50);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [s, sa, al, pr] = await Promise.all([
        fetch('/api/admin/system'), fetch('/api/admin/sales'), fetch('/api/admin/alerts'), fetch('/api/admin/products'),
      ]);
      if (s.ok) setStats(await s.json());
      if (sa.ok) setSales(await sa.json());
      if (al.ok) setAlerts(await al.json());
      if (pr.ok) setProducts(await pr.json());
    } catch (e) { console.error(e); }
  };

  const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const handleCreateAgent = async () => {
    if (!agentName.trim()) { showToast('error', 'Enter an agent username.'); return; }
    try {
      const res = await fetch('/api/admin/managers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: agentName.trim(), password: agentPass || undefined, full_name: agentName.trim(), shift_start: '08:00', shift_end: '17:00' }),
      });
      if (res.ok) { const d = await res.json(); showToast('success', `Agent created${d.temporaryPassword ? ` · temp pass: ${d.temporaryPassword}` : ''}`); setAgentName(''); setAgentPass(''); fetchAllData(); }
      else showToast('error', 'Failed — username may be taken.');
    } catch { showToast('error', 'Error creating agent.'); }
  };

  const handleRestock = async () => {
    if (!selectedProduct) { showToast('error', 'Select a product first.'); return; }
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct}/restock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: restockQty }),
      });
      if (res.ok) { showToast('success', `Added ${restockQty} units.`); fetchAllData(); }
      else { const d = await res.json().catch(() => ({})); showToast('error', d.error || 'Failed to restock.'); }
    } catch { showToast('error', 'Error restocking.'); }
  };

  const voidSale = async (id: string) => {
    if (!confirm('Void this sale? The stock will be returned to inventory. This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/sales/${id}/void`, { method: 'POST' });
      if (res.ok) { const d = await res.json(); showToast('success', `Sale voided · ${d.restored} units restored.`); fetchAllData(); }
      else { const d = await res.json().catch(() => ({})); showToast('error', d.error || 'Failed to void sale.'); }
    } catch { showToast('error', 'Error voiding sale.'); }
  };

  const handleDownloadReport = () => {
    let csv = 'data:text/csv;charset=utf-8,Time,Manager,Product,Qty,Total RWF\n';
    sales.forEach(r => { csv += `"${new Date(r.created_at).toLocaleString()}","${r.manager?.full_name || 'Unknown'}","${r.product?.name || 'Unknown'}",${r.quantity},${r.total_amount}\n`; });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // Real hourly sales chart (today)
  const chart = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    sales.filter(s => new Date(s.created_at) >= start).forEach(s => {
      const h = new Date(s.created_at).getHours();
      const b = h < 10 ? 0 : h < 12 ? 1 : h < 14 ? 2 : h < 16 ? 3 : h < 18 ? 4 : h < 20 ? 5 : 6;
      buckets[b] += s.total_amount;
    });
    const max = Math.max(...buckets, 1);
    return buckets.map(v => Math.round((v / max) * 100));
  }, [sales]);

  const totalStock = products.reduce((a, p) => a + p.stock_units, 0);
  const lowStock = products.filter(p => p.stock_units > 0 && p.stock_units <= p.min_stock_threshold);
  const recent = sales.slice(0, 6);

  return (
    <div className="w-full">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/admin/products')} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"><Plus size={16} /> Add Product</button>
          <button onClick={handleDownloadReport} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25"><Download size={16} /> Report</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={Banknote} tint="green" label="Today's Earnings" value={`RWF ${stats.totalRevenue.toLocaleString()}`} sub={`Avg RWF ${stats.unitsSold > 0 ? Math.round(stats.totalRevenue / stats.unitsSold).toLocaleString() : 0}/sale`} />
        <Kpi icon={ShoppingCart} tint="blue" label="Sales Today" value={stats.unitsSold} sub="transactions" />
        <Kpi icon={Users} tint="amber" label="Active Agents" value={stats.activeManagers} sub="online recently" />
        <Kpi icon={BellRing} tint={stats.unreadAlertsCount > 0 ? 'red' : 'gray'} label="Unresolved Alerts" value={stats.unreadAlertsCount} sub={`${alerts.filter(a => a.severity === 'CRITICAL').length} critical`} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><TrendingUp size={20} className="text-amber-500" /> Sales Today</h3>
            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"><ArrowUpRight size={12} /> Live</span>
          </div>
          <div className="h-44 flex items-end justify-between gap-3">
            {chart.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-[#F4F7FE] rounded-t-lg flex items-end" style={{ height: '100%' }}>
                  <div className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-700 group-hover:from-amber-600" style={{ height: `${Math.max(h, 3)}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{['8a', '10a', '12p', '2p', '4p', '6p', '8p'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6 space-y-5">
          <h3 className="text-lg font-extrabold text-gray-900">Quick Actions</h3>
          {/* Create agent */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><UserPlus size={14} /> New Sales Agent</p>
            <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Username" className="w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <input value={agentPass} onChange={e => setAgentPass(e.target.value)} type="password" placeholder="Password (optional)" className="w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button onClick={handleCreateAgent} className="w-full bg-[#1E2336] hover:bg-black text-white py-2.5 rounded-xl font-bold text-sm transition">Create Agent</button>
          </div>
          {/* Restock */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5"><PackagePlus size={14} /> Quick Restock</p>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">Pick a product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock_units})</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" min="1" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} className="w-24 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <button onClick={handleRestock} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5"><Plus size={16} /> Add Stock</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div id="alerts" className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6 scroll-mt-24">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-4"><ShieldAlert size={20} className="text-red-500" /> System Alerts</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-10 text-gray-400"><CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-400" /><p className="text-sm font-medium">All clear — no active alerts.</p></div>
            ) : alerts.map(a => (
              <div key={a.id} className={`p-3.5 rounded-xl border ${a.severity === 'CRITICAL' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className={a.severity === 'CRITICAL' ? 'text-red-500 mt-0.5' : 'text-amber-500 mt-0.5'} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{a.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{a.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory snapshot */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><Package size={20} className="text-amber-500" /> Inventory</h3>
            <span className="text-sm font-black text-gray-900">{totalStock.toLocaleString()} <span className="text-gray-400 font-medium text-xs">units</span></span>
          </div>
          {lowStock.length > 0 && <p className="text-xs font-bold text-amber-600 mb-3">⚠ {lowStock.length} item(s) low on stock</p>}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {products.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F7FE]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                    {p.image_url ? <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Package size={16} />}
                  </div>
                  <span className="font-bold text-sm text-gray-900 truncate">{p.name}</span>
                </div>
                <span className={`text-sm font-bold ${p.stock_units <= p.min_stock_threshold ? 'text-red-500' : 'text-emerald-600'}`}>{p.stock_units}</span>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No products yet.</p>}
          </div>
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-4"><ShoppingCart size={20} className="text-amber-500" /> Recent Sales</h3>
          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No sales recorded yet.</p>
            ) : recent.map((r, i) => {
              const voided = r.status === 'VOIDED';
              return (
                <div key={r.id || i} className={`flex items-center justify-between rounded-xl p-3 ${voided ? 'bg-gray-50 opacity-70' : r.flagged ? 'bg-amber-50 border border-amber-100' : 'bg-[#F4F7FE]'}`}>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${voided ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {r.product?.name || 'Product'} {r.flagged && !voided && <span title={r.flag_reason || 'Flagged'} className="text-amber-500">⚑</span>}
                    </p>
                    <p className="text-[11px] text-gray-500">{r.manager?.full_name || 'Agent'} · {r.quantity} {r.sale_type} · {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {voided
                      ? <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Voided</span>
                      : <>
                          <span className="font-black text-emerald-600 text-sm">+{(r.total_amount || 0).toLocaleString()}</span>
                          <button onClick={() => voidSale(r.id)} title="Void sale & restore stock" className="text-gray-300 hover:text-red-500 transition"><Ban size={16} /></button>
                        </>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-4 z-[60] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-bold text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}{toast.msg}
        </div>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, tint, label, value, sub }: { icon: any; tint: string; label: string; value: any; sub?: string }) {
  const tints: Record<string, string> = {
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    amber: 'from-amber-400 to-amber-500 shadow-amber-500/30',
    red: 'from-red-500 to-rose-600 shadow-rose-500/30',
    gray: 'from-slate-400 to-slate-500 shadow-slate-500/30',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9EDF7] shadow-[0_4px_24px_rgba(16,24,40,0.05)] hover:shadow-[0_10px_30px_rgba(16,24,40,0.10)] hover:-translate-y-0.5 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br text-white shadow-lg ${tints[tint]}`}><Icon size={22} /></div>
      <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 font-medium mt-1.5">{sub}</p>}
    </div>
  );
}
