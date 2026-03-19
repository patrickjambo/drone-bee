'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';

export default function AdminAudits() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = () => {
    fetch('/api/admin/audits')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAudits(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudits();
    const interval = setInterval(fetchAudits, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full">
      

      <div className="h-full w-full">
        
        <div className="h-full w-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">System Audit Logs</h1>
            <p className="text-gray-500 font-medium">Immutable records of manager and system actions.</p>
          </div>
          <div className="flex gap-3">
             <button className="bg-white border border-[#E9EDF7] hover:bg-[#F4F7FE] text-gray-900 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
                <Filter size={20} /> Filter Logs
             </button>
             <div className="bg-[#01B574]/10 text-[#01B574] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm border border-[#01B574]/20">
                <ShieldCheck size={20} />
                {audits.length} Records Secure
             </div>
          </div>
        </header>

        <div className="bg-white rounded-[20px] shadow-sm border border-[#E9EDF7] overflow-hidden">
          <div className="p-6 border-b border-[#E9EDF7] flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Trail of Activities</h2>
            <div className="flex bg-[#F4F7FE] items-center px-4 py-2 rounded-xl">
               <Search size={18} className="text-gray-500 mr-2" />
               <input type="text" placeholder="Search events..." className="bg-transparent border-none outline-none text-gray-900 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[500px]">
            {loading ? (
              <div className="flex justify-center p-12 text-gray-500">Loading audit trail...</div>
            ) : (
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7] sticky top-0">
                  <tr>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">TIMESTAMP</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">USER</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">ACTION TYPE</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">DESCRIPTION</th>
                    <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">IP / DEVICE</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 px-6 text-center text-gray-500">No audit logs found.</td></tr>
                  ) : (
                    audits.map(log => (
                      <tr key={log.id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">
                          {log.user?.full_name || 'System / Automated'}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="bg-[#E5ECF6] text-amber-500 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">
                            {log.action_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-900 min-w-[300px] font-medium">
                          {log.description}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 max-w-[200px]">
                          <div className="font-mono text-gray-900 mb-1"><span className="text-gray-500">IP:</span> {log.ip_address || 'N/A'}</div>
                          <div className="truncate" title={log.user_agent}>
                            <span className="text-gray-500">Device:</span> {log.user_agent || 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
