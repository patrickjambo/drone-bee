'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Banknote, ShoppingCart, BarChart3, Crown, Users, Clock, Download } from 'lucide-react';

type Data = {
  totalRevenue: number; totalUnits: number; count: number; avg: number; days: number;
  trend: { date: string; revenue: number }[];
  topProducts: { name: string; type: string; revenue: number; qty: number }[];
  byManager: { name: string; revenue: number; count: number }[];
  hours: number[];
};

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`).then(r => r.ok ? r.json() : null).then(d => { if (d && !d.error) setData(d); }).finally(() => setLoading(false));
  }, [days]);

  const maxTrend = data ? Math.max(...data.trend.map(t => t.revenue), 1) : 1;
  const maxProd = data ? Math.max(...data.topProducts.map(p => p.revenue), 1) : 1;
  const maxMgr = data ? Math.max(...data.byManager.map(m => m.revenue), 1) : 1;
  const maxHour = data ? Math.max(...data.hours, 1) : 1;

  const exportCsv = () => {
    if (!data) return;
    let csv = 'data:text/csv;charset=utf-8,Date,Revenue RWF\n';
    data.trend.forEach(t => { csv += `${t.date},${t.revenue}\n`; });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `analytics-${days}d.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2.5"><BarChart3 className="text-amber-500" size={28} /> Analytics</h1>
          <p className="text-gray-500 mt-1">Performance insights from your real sales data.</p>
        </div>
        <div className="flex gap-2">
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="bg-white border border-[#E9EDF7] rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25"><Download size={16} /> Export</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white border border-[#E9EDF7] animate-pulse" />)}</div>
      ) : !data ? (
        <div className="bg-white rounded-2xl border border-[#E9EDF7] p-12 text-center text-gray-400">Could not load analytics.</div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Kpi icon={Banknote} tint="green" label={`Revenue · ${days}d`} value={`RWF ${data.totalRevenue.toLocaleString()}`} />
            <Kpi icon={ShoppingCart} tint="blue" label="Sales" value={data.count} />
            <Kpi icon={TrendingUp} tint="amber" label="Avg. Sale" value={`RWF ${data.avg.toLocaleString()}`} />
            <Kpi icon={BarChart3} tint="gray" label="Units Sold" value={data.totalUnits.toLocaleString()} />
          </div>

          {/* Trend */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6 mb-6">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-6"><TrendingUp size={20} className="text-amber-500" /> Revenue Trend</h3>
            <div className="h-52 flex items-end gap-1 overflow-x-auto">
              {data.trend.map((t, i) => (
                <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10">RWF {t.revenue.toLocaleString()}</div>
                  <div className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t transition-all hover:from-amber-600" style={{ height: `${Math.max((t.revenue / maxTrend) * 100, 1)}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
              <span>{data.trend[0]?.date.slice(5)}</span>
              <span>{data.trend[Math.floor(data.trend.length / 2)]?.date.slice(5)}</span>
              <span>{data.trend[data.trend.length - 1]?.date.slice(5)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top products */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-5"><Crown size={20} className="text-amber-500" /> Top Products</h3>
              {data.topProducts.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No sales in this period.</p> : (
                <div className="space-y-4">
                  {data.topProducts.map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><span className={`w-5 h-5 rounded-md text-[11px] flex items-center justify-center font-black ${i === 0 ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>{p.name} <span className="text-xs text-gray-400 font-medium">· {p.qty} sold</span></p>
                        <span className="text-sm font-black text-gray-900">RWF {p.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(p.revenue / maxProd) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By manager */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-5"><Users size={20} className="text-amber-500" /> Sales by Agent</h3>
              {data.byManager.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">No sales in this period.</p> : (
                <div className="space-y-4">
                  {data.byManager.map((m, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-sm font-bold text-gray-800">{m.name} <span className="text-xs text-gray-400 font-medium">· {m.count} sales</span></p>
                        <span className="text-sm font-black text-gray-900">RWF {m.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(m.revenue / maxMgr) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* By hour */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] p-6">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-6"><Clock size={20} className="text-amber-500" /> Busiest Hours</h3>
            <div className="h-40 flex items-end gap-1">
              {data.hours.map((v, h) => (
                <div key={h} className="flex-1 flex flex-col items-center justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">{h}:00</div>
                  <div className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t" style={{ height: `${Math.max((v / maxHour) * 100, 1)}%` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, tint, label, value }: { icon: any; tint: string; label: string; value: any }) {
  const tints: Record<string, string> = {
    green: 'from-emerald-500 to-emerald-600', blue: 'from-blue-500 to-blue-600',
    amber: 'from-amber-400 to-amber-500', gray: 'from-slate-400 to-slate-500',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E9EDF7] shadow-[0_4px_24px_rgba(16,24,40,0.05)]">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br text-white shadow-lg ${tints[tint]}`}><Icon size={20} /></div>
      <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    </div>
  );
}
