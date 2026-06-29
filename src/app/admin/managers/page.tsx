'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Users, Search, AlertTriangle, CheckCircle2, X, KeyRound, Pencil, Ban, Trash2, ShieldCheck } from 'lucide-react';

type Manager = {
  id: string; full_name: string; username: string;
  shift_start?: string | null; shift_end?: string | null; phone?: string | null; is_blocked: boolean;
};

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Manager | null>(null);
  const [credentials, setCredentials] = useState<{ title: string; username: string; password: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [form, setForm] = useState({ full_name: '', username: '', password: '', shift_start: '08:00', shift_end: '17:00', phone: '' });

  useEffect(() => { fetchManagers(); const i = setInterval(fetchManagers, 12000); return () => clearInterval(i); }, []);

  const fetchManagers = async () => {
    try { const res = await fetch('/api/admin/managers'); const data = await res.json(); if (Array.isArray(data)) setManagers(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return managers;
    return managers.filter(m => m.full_name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q) || (m.phone || '').includes(q));
  }, [managers, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/managers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        setShowCreate(false);
        setCredentials({ title: 'Agent Account Created', username: data.username, password: data.temporaryPassword });
        setForm({ full_name: '', username: '', password: '', shift_start: '08:00', shift_end: '17:00', phone: '' });
        fetchManagers();
      } else showToast('error', data.error || 'Failed — username may be taken.');
    } catch { showToast('error', 'Error creating agent.'); }
  };

  const toggleBlock = async (m: Manager) => {
    try {
      const res = await fetch(`/api/admin/managers/${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_blocked: !m.is_blocked }) });
      if (res.ok) { showToast('success', `${m.full_name} ${m.is_blocked ? 'unblocked' : 'blocked'}.`); fetchManagers(); }
      else showToast('error', 'Failed to update.');
    } catch { showToast('error', 'Error updating agent.'); }
  };

  const resetPassword = async (m: Manager) => {
    if (!confirm(`Reset password for ${m.full_name}? A new temporary password will be generated.`)) return;
    try {
      const res = await fetch(`/api/admin/managers/${m.id}/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      if (res.ok) setCredentials({ title: 'Password Reset', username: data.username, password: data.temporaryPassword });
      else showToast('error', data.error || 'Failed to reset.');
    } catch { showToast('error', 'Error resetting password.'); }
  };

  const removeAgent = async (m: Manager) => {
    if (!confirm(`Remove ${m.full_name}? They will no longer be able to log in.`)) return;
    try {
      const res = await fetch(`/api/admin/managers/${m.id}`, { method: 'DELETE' });
      if (res.ok) { showToast('success', `${m.full_name} removed.`); fetchManagers(); }
      else showToast('error', 'Failed to remove.');
    } catch { showToast('error', 'Error removing agent.'); }
  };

  const activeCount = managers.filter(m => !m.is_blocked).length;
  const blockedCount = managers.filter(m => m.is_blocked).length;
  const inputCls = 'w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400';

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2.5"><Users className="text-amber-500" size={28} /> Sales Agents & Staff</h1>
          <p className="text-gray-500 mt-1">Manage credentials, shifts and access for your field agents.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition"><Plus size={20} /> Create Agent</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Tile label="Total Agents" value={managers.length} tint="bg-blue-50 text-blue-600" icon={Users} />
        <Tile label="Active" value={activeCount} tint="bg-emerald-50 text-emerald-600" icon={ShieldCheck} />
        <Tile label="Blocked" value={blockedCount} tint="bg-red-50 text-red-600" icon={Ban} />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] overflow-hidden">
        <div className="p-5 border-b border-[#E9EDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Field Agents</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents…" className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {loading ? <div className="p-12 text-center text-gray-400">Loading staff…</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                <tr>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Agent</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Shift</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Phone</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Status</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 px-5 text-center text-gray-400">No agents found.</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center font-black shrink-0">{m.full_name.charAt(0).toUpperCase()}</div>
                        <div><span className="font-bold text-gray-900 block">{m.full_name}</span><span className="text-sm text-gray-400">@{m.username}</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-medium text-gray-700">{m.shift_start || '—'} – {m.shift_end || '—'}</td>
                    <td className="py-4 px-5 font-medium text-gray-700">{m.phone || '—'}</td>
                    <td className="py-4 px-5">
                      {m.is_blocked
                        ? <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit text-sm"><AlertTriangle size={14} /> Blocked</span>
                        : <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit text-sm"><CheckCircle2 size={14} /> Active</span>}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconBtn title="Edit" onClick={() => setEditTarget(m)}><Pencil size={15} /></IconBtn>
                        <IconBtn title="Reset password" onClick={() => resetPassword(m)}><KeyRound size={15} /></IconBtn>
                        <IconBtn title={m.is_blocked ? 'Unblock' : 'Block'} onClick={() => toggleBlock(m)} className={m.is_blocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}>{m.is_blocked ? <CheckCircle2 size={15} /> : <Ban size={15} />}</IconBtn>
                        <IconBtn title="Remove" onClick={() => removeAgent(m)} className="text-red-500 hover:bg-red-50"><Trash2 size={15} /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal title="Create Agent Account" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <Field label="Full Name"><input required className={inputCls} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></Field>
            <Field label="Username"><input required className={inputCls} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} onFocus={() => { if (!form.username && form.full_name) setForm(f => ({ ...f, username: f.full_name.toLowerCase().replace(/\s+/g, '_') })); }} /></Field>
            <Field label="Password (leave blank to auto-generate)"><input className={inputCls} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Auto-generated if empty" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Shift Start"><input type="time" className={inputCls} value={form.shift_start} onChange={e => setForm({ ...form, shift_start: e.target.value })} /></Field>
              <Field label="Shift End"><input type="time" className={inputCls} value={form.shift_end} onChange={e => setForm({ ...form, shift_end: e.target.value })} /></Field>
            </div>
            <Field label="Phone"><input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+250…" /></Field>
            <div className="flex gap-3 pt-2 border-t border-[#E9EDF7]">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/25">Create Agent</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal manager={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); fetchManagers(); showToast('success', 'Agent updated.'); }} onError={(m) => showToast('error', m)} />
      )}

      {/* Credentials reveal */}
      {credentials && (
        <Modal title={credentials.title} onClose={() => setCredentials(null)}>
          <div className="p-6 space-y-5 text-center">
            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-100 text-left text-sm"><strong>Record this now</strong> — the password is shown only once and cannot be retrieved again.</div>
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="text-emerald-500 w-7 h-7" /></div>
            <div className="bg-[#F4F7FE] p-5 rounded-xl border border-[#E9EDF7] font-mono text-left space-y-3">
              <div className="flex justify-between items-center border-b border-[#E9EDF7] pb-3"><span className="text-gray-500 font-sans font-bold text-sm">USERNAME</span><span className="text-gray-900 font-bold">{credentials.username}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-500 font-sans font-bold text-sm">PASSWORD</span><span className="text-amber-600 font-black tracking-wider">{credentials.password}</span></div>
            </div>
            <button onClick={() => setCredentials(null)} className="w-full py-3.5 bg-[#1E2336] hover:bg-black text-white rounded-xl font-bold transition">Done</button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-4 z-[70] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-bold text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
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

function IconBtn({ children, title, onClick, className = 'text-gray-500 hover:bg-gray-100' }: { children: React.ReactNode; title: string; onClick: () => void; className?: string }) {
  return <button title={title} onClick={onClick} className={`p-2 rounded-lg transition ${className}`}>{children}</button>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] bg-[#1E2336]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E9EDF7] sticky top-0 bg-white"><h3 className="text-lg font-bold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>{children}</div>;
}

function EditModal({ manager, onClose, onSaved, onError }: { manager: Manager; onClose: () => void; onSaved: () => void; onError: (m: string) => void }) {
  const [form, setForm] = useState({ full_name: manager.full_name, shift_start: manager.shift_start || '08:00', shift_end: manager.shift_end || '17:00', phone: manager.phone || '' });
  const [saving, setSaving] = useState(false);
  const inputCls = 'w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/managers/${manager.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed'); }
      onSaved();
    } catch (err: any) { onError(err.message); } finally { setSaving(false); }
  };

  return (
    <Modal title={`Edit ${manager.username}`} onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        <Field label="Full Name"><input required className={inputCls} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Shift Start"><input type="time" className={inputCls} value={form.shift_start} onChange={e => setForm({ ...form, shift_start: e.target.value })} /></Field>
          <Field label="Shift End"><input type="time" className={inputCls} value={form.shift_end} onChange={e => setForm({ ...form, shift_end: e.target.value })} /></Field>
        </div>
        <Field label="Phone"><input className={inputCls} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
        <div className="flex gap-3 pt-2 border-t border-[#E9EDF7]">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white font-bold">{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
}
