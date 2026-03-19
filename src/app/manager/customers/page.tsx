'use client';
import React, { useState, useEffect } from 'react';

import { Users, Clock, Search, Bell, ChevronDown, Plus, Mail, Phone, MoreHorizontal, Star, X } from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: string;
  points: number;
  total_spent: number;
  last_visit: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', type: 'Registered' });

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/manager/customers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        console.error("Failed to load customers:", data);
        setCustomers([]);
      }
    } catch (e) {
      console.error(e);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 10000); // 10s auto update
    return () => clearInterval(interval);
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const res = await fetch('/api/manager/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', phone: '', email: '', type: 'Registered' });
        fetchCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="h-full w-full">
      
      <div className="h-full w-full">
        

        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3"><Users className="text-amber-500" size={28} /> Customer Management</h1>
              <p className="text-gray-500 mt-1 text-sm">View and manage registered customers, loyalty points, and purchase histories.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-[#FFC107] hover:bg-[#F2B705] text-gray-900 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Plus size={18} /> Add Customer
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 relative">
            {loading ? (
              <div className="p-12 text-center text-gray-400">Loading customers...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F4F7FE] border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-[#A3AED0] font-bold text-xs tracking-wider uppercase">Customer Profile</th>
                    <th className="py-4 px-6 text-[#A3AED0] font-bold text-xs tracking-wider uppercase">Contact Info</th>
                    <th className="py-4 px-6 text-[#A3AED0] font-bold text-xs tracking-wider uppercase">Class</th>
                    <th className="py-4 px-6 text-[#A3AED0] font-bold text-xs tracking-wider uppercase">Loyalty Points</th>
                    <th className="py-4 px-6 text-[#A3AED0] font-bold text-xs tracking-wider uppercase">Total Spent</th>
                    <th className="py-4 px-6 text-[#A3AED0] font-bold text-xs tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-500">Last visit: {new Date(c.last_visit).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                         <p className="text-sm text-gray-700 flex items-center gap-2 mb-1"><Phone size={14} className="text-gray-400"/> {c.phone || '-'}</p>
                         {c.email && <p className="text-xs text-gray-500 flex items-center gap-2"><Mail size={12} className="text-gray-400"/> {c.email}</p>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          c.type === 'VIP' ? 'bg-purple-100 text-purple-700' : 
                          c.type === 'Registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                          <Star size={14} className={c.points > 0 ? "text-amber-500 fill-amber-500" : "text-gray-300"} />
                          {c.points} pts
                        </p>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900">RWF {c.total_spent.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                <Users size={48} className="mb-4 opacity-20" />
                <p>No customers found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="e.g. Alice Mutoni" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="+250 788 000 000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm" placeholder="alice@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Customer Class</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm">
                    <option value="Registered">Registered</option>
                    <option value="VIP">VIP</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#FFC107] text-gray-900 rounded-lg font-bold hover:bg-[#F2B705] transition-colors shadow-sm">Save Customer</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
