'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminManagerCreation() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{username: string, password: string} | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    shift_start: '08:00',
    shift_end: '17:00',
    phone: '',
  });

  useEffect(() => {
    fetchManagers();
    const interval = setInterval(fetchManagers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await fetch('/api/admin/managers');
      const data = await res.json();
      setManagers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (res.ok) {
        setTempCredentials({ username: data.username, password: data.temporaryPassword });
        fetchManagers();
        setFormData({ full_name: '', username: '', shift_start: '08:00', shift_end: '17:00', phone: ''});
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closeAndClearModal = () => {
    setShowModal(false);
    setTempCredentials(null); 
  };

  return (
    <div className="h-full">
      
      
      <div className="h-full w-full">
        
        <div className="h-full w-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales Agents & Staff</h1>
            <p className="text-gray-500 font-medium">Manage credentials, shifts, and active personnel</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-[#3211b8] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#4318FF]/20"
          >
            <Plus size={20} />
            Create Agent Account
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center p-12 text-gray-500">Loading staff accounts...</div>
        ) : (
          <div className="bg-white rounded-[20px] shadow-sm border border-[#E9EDF7] overflow-hidden">
            <div className="p-6 border-b border-[#E9EDF7] flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Field Agents</h2>
              <div className="flex bg-[#F4F7FE] items-center px-4 py-2 rounded-xl">
                 <Search size={18} className="text-gray-500 mr-2" />
                 <input type="text" placeholder="Search agents..." className="bg-transparent border-none outline-none text-gray-900 text-sm" />
              </div>
            </div>
            
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                <tr>
                  <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">FULL NAME</th>
                  <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">USERNAME</th>
                  <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">SHIFT TIME</th>
                  <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">PHONE</th>
                  <th className="py-4 px-6 text-gray-500 font-bold text-sm tracking-wide">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {managers.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 px-6 text-center text-gray-500">No managers created yet.</td></tr>
                ) : (
                  managers.map((m: any) => (
                    <tr key={m.id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#E5ECF6] flex items-center justify-center text-amber-500 font-bold">
                             {m.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-900">{m.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-500">@{m.username}</td>
                      <td className="py-4 px-6 font-medium text-gray-900">{m.shift_start} - {m.shift_end}</td>
                      <td className="py-4 px-6 font-medium text-gray-900">{m.phone}</td>
                      <td className="py-4 px-6">
                        {m.is_blocked ? 
                          <span className="text-[#EE5D50] bg-[#EE5D50]/10 px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit">
                            <AlertTriangle size={14} /> Blocked
                          </span> : 
                          <span className="text-[#01B574] bg-[#01B574]/10 px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 size={14} /> Active
                          </span>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#1E2336]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              {!tempCredentials ? (
                <>
                  <div className="p-6 border-b border-[#E9EDF7] bg-[#F4F7FE]">
                    <h3 className="text-xl font-bold text-gray-900">Create Agent Account</h3>
                  </div>
                  <form onSubmit={handleCreate} className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                      <input type="text" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Username (Auto-suggested)</label>
                      <input type="text" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} onFocus={() => { if(!formData.username) setFormData({...formData, username: formData.full_name.toLowerCase().replace(/\s/g, '_')}); }} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Shift Start</label>
                        <input type="time" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.shift_start} onChange={e => setFormData({...formData, shift_start: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Shift End</label>
                        <input type="time" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.shift_end} onChange={e => setFormData({...formData, shift_end: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Phone (For Alerts)</label>
                      <input type="text" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#E9EDF7]">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-[#F4F7FE] transition-colors">Cancel</button>
                      <button type="submit" className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3211b8] transition-colors shadow-lg shadow-[#4318FF]/20">Create Agent</button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="p-8 text-center space-y-6">
                  <div className="bg-[#FFE2E5] text-[#EE5D50] p-4 rounded-xl border border-[#EE5D50]/20 mb-4 text-left shadow-sm">
                    <strong>SECURITY NOTE:</strong> Record these credentials now! They will only be shown this one time and cannot be retrieved again due to system encryption.
                  </div>
                  
                  <div className="w-16 h-16 bg-[#01B574]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-[#01B574] w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Agent Account Ready</h2>
                  
                  <div className="bg-[#F4F7FE] p-6 rounded-xl font-mono text-left border border-[#E9EDF7] space-y-3">
                    <div className="flex justify-between items-center border-b border-[#E9EDF7] pb-3">
                      <span className="text-gray-500 font-sans font-bold text-sm">USERNAME</span>
                      <span className="text-gray-900 font-bold">{tempCredentials.username}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-gray-500 font-sans font-bold text-sm">TEMPORARY PASSWORD</span>
                      <span className="text-amber-500 font-black tracking-wider">{tempCredentials.password}</span>
                    </div>
                  </div>
                  <button onClick={closeAndClearModal} className="w-full py-4 bg-[#1E2336] hover:bg-[#111421] text-white rounded-xl font-bold transition-colors">
                    I Have Dispatched These Credentials safely
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
