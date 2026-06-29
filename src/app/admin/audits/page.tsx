'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Download } from 'lucide-react';

export default function AdminAudits() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const fetchAudits = () => {
    fetch('/api/admin/audits')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setAudits(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudits();
    const interval = setInterval(fetchAudits, 12000);
    return () => clearInterval(interval);
  }, []);

  const actionTypes = useMemo(() => ['All', ...Array.from(new Set(audits.map(a => a.action_type)))], [audits]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return audits.filter(a => {
      const matchAction = actionFilter === 'All' || a.action_type === actionFilter;
      const matchSearch = !q ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.user?.full_name || '').toLowerCase().includes(q) ||
        (a.action_type || '').toLowerCase().includes(q) ||
        (a.ip_address || '').toLowerCase().includes(q);
      return matchAction && matchSearch;
    });
  }, [audits, search, actionFilter]);

  const exportCsv = () => {
    let csv = 'data:text/csv;charset=utf-8,Time,User,Action,Description,IP\n';
    filtered.forEach(a => { csv += `"${new Date(a.created_at).toLocaleString()}","${a.user?.full_name || 'System'}","${a.action_type}","${(a.description || '').replace(/"/g, "'")}","${a.ip_address || ''}"\n`; });
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2.5"><ShieldCheck className="text-amber-500" size={28} /> System Audit Logs</h1>
          <p className="text-gray-500 mt-1">Immutable records of every manager and system action.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-emerald-100 text-sm"><ShieldCheck size={18} /> {audits.length} secured</span>
          <button onClick={exportCsv} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 text-sm"><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] overflow-hidden">
        <div className="p-5 border-b border-[#E9EDF7] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, users, IPs…" className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {actionTypes.slice(0, 8).map(t => (
              <button key={t} onClick={() => setActionFilter(t)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${actionFilter === t ? 'bg-[#1E2336] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t === 'All' ? 'All' : t.replace(/_/g, ' ')}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center p-12 text-gray-400">Loading audit trail…</div>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7] sticky top-0">
                <tr>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Timestamp</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">User</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Action</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Description</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">IP / Device</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 px-5 text-center text-gray-400">No matching audit logs.</td></tr>
                ) : filtered.map(log => (
                  <tr key={log.id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/60 transition-colors">
                    <td className="py-4 px-5 text-sm font-medium text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-4 px-5 font-bold text-gray-900 whitespace-nowrap">{log.user?.full_name || 'System / Automated'}</td>
                    <td className="py-4 px-5 whitespace-nowrap"><span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase">{(log.action_type || '').replace(/_/g, ' ')}</span></td>
                    <td className="py-4 px-5 text-gray-800 min-w-[280px] text-sm">{log.description}</td>
                    <td className="py-4 px-5 text-xs text-gray-500 max-w-[200px]">
                      <div className="font-mono text-gray-700 mb-1"><span className="text-gray-400">IP:</span> {log.ip_address || 'N/A'}</div>
                      <div className="truncate" title={log.user_agent}><span className="text-gray-400">Device:</span> {log.user_agent || 'N/A'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
