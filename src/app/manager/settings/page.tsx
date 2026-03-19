'use client';
import React, { useState } from 'react';

import { Settings, Clock, Search, Bell, ChevronDown, CheckCircle, Save, Printer, Percent, Store, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-gray-800 relative">
      
      <div className="h-full w-full">
        

        <div className="h-full w-full">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3"><Settings className="text-amber-500" size={28} /> System Settings</h1>
              <p className="text-gray-500 mt-1 text-sm">Configure receipt printers, POS hardware, and localized defaults.</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#1E2336] hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70"
            >
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
             <div className="w-full lg:w-64 flex-shrink-0">
               <nav className="flex flex-col space-y-1">
                 <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'general' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                   <Store size={18} /> Store Details
                 </button>
                 <button onClick={() => setActiveTab('hardware')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'hardware' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                   <Printer size={18} /> POS & Hardware
                 </button>
                 <button onClick={() => setActiveTab('tax')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'tax' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                   <Percent size={18} /> Tax & Financial
                 </button>
                 <button onClick={() => setActiveTab('payment')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'payment' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                   <CreditCard size={18} /> Payment Methods
                 </button>
               </nav>
             </div>

             <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
               {activeTab === 'general' && (
                 <div className="space-y-6">
                   <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Store Identity</h2>
                   <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">Store Name</label>
                       <input type="text" defaultValue="Drone Bee Main Branch" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 text-gray-900" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700">Phone Number</label>
                       <input type="text" defaultValue="+250 788 000 000" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 text-gray-900" />
                     </div>
                     <div className="space-y-2 col-span-2">
                       <label className="text-sm font-bold text-gray-700">Physical Address</label>
                       <textarea rows={3} defaultValue="Kigali, Rwanda. Down town street 4." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50 text-gray-900"></textarea>
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === 'hardware' && (
                 <div className="space-y-6">
                   <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Receipt Printer Configuration</h2>
                   <div className="space-y-4">
                     <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                       <input type="radio" name="printer" className="w-4 h-4 text-amber-500" defaultChecked />
                       <div className="flex-1">
                         <p className="font-bold text-gray-900">Epson TM-T88VI</p>
                         <p className="text-xs text-gray-500">USB Connection • System Default</p>
                       </div>
                       <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Connected</span>
                     </label>
                     <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 opacity-60">
                       <input type="radio" name="printer" className="w-4 h-4 text-amber-500" />
                       <div className="flex-1">
                         <p className="font-bold text-gray-900">Generic Bluetooth Thermal Printer</p>
                         <p className="text-xs text-gray-500">Bluetooth • Address: 00:11:22:33</p>
                       </div>
                       <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-md">Offline</span>
                     </label>
                     
                     <div className="pt-4 border-t border-gray-100 mt-6">
                       <p className="font-bold text-gray-900 mb-4">Print Options</p>
                       <label className="flex items-center gap-3 mb-3 cursor-pointer">
                         <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500" />
                         <span className="text-sm text-gray-700">Automatically print receipt on checkout</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer">
                         <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500" />
                         <span className="text-sm text-gray-700">Open cash drawer automatically</span>
                       </label>
                     </div>
                   </div>
                 </div>
               )}

               {(activeTab === 'tax' || activeTab === 'payment') && (
                 <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <Settings size={48} className="mb-4 opacity-20" />
                    <h3 className="text-lg font-bold text-gray-600 mb-2">Module locked to Superadmin</h3>
                    <p className="text-sm">These financial settings require elevated privileges to modify to prevent accidental accounting discrepancies.</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Success Toast */}
        {showToast && (
          <div className="absolute bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl animate-in slide-in-from-bottom-5">
            <CheckCircle className="text-green-400" size={20} />
            <p className="font-bold text-sm">Settings saved successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
