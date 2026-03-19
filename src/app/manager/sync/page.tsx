'use client';
import React, { useState } from 'react';

import { RefreshCcw, Clock, Search, Bell, ChevronDown, CheckCircle2, Wifi, WifiOff, UploadCloud, Database } from 'lucide-react';

export default function SyncCenterPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Online, Queued Data');
  const [offlineDocs, setOfflineDocs] = useState(14);
  const [lastSync, setLastSync] = useState('10 minutes ago');

  const handleSync = () => {
    setIsSyncing(true);
    setSyncStatus('Synchronizing with Cloud DB...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Fully Synchronized');
      setOfflineDocs(0);
      setLastSync('Just now');
    }, 3000);
  };

  return (
    <div className="h-full w-full">
      
      <div className="h-full w-full">
        

        <div className="flex-1 p-8 flex flex-col overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3"><RefreshCcw className="text-amber-500" size={28} /> Sync Center</h1>
            <p className="text-gray-500 mt-1 text-sm">Manage offline queues and synchronize local cached transactions to the cloud.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${offlineDocs > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                <Database size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Local Memory Queue</p>
                <h3 className="text-2xl font-black text-gray-900">{offlineDocs} <span className="text-sm text-gray-500 font-medium">pending items</span></h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wifi size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Network Status</p>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">Connected <span className="w-2 h-2 rounded-full bg-green-500"></span></h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                <Clock size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Last Synchronization</p>
                <h3 className="text-lg font-bold text-gray-900">{lastSync}</h3>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center p-12 text-center text-gray-800">
            <div className="relative mb-6">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center ${offlineDocs === 0 ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                {offlineDocs === 0 ? <CheckCircle2 size={48} /> : <UploadCloud size={48} />}
              </div>
              {isSyncing && (
                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              )}
            </div>
            
            <h2 className="text-2xl font-black mb-2">{syncStatus}</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              {offlineDocs > 0 
                ? "You have local offline transactions that haven't been pushed to the main Drone Bee server yet. We recommend syncing at the end of every shift."
                : "All local transactional data is safely pushed and redundantly stored on the cloud API."}
            </p>

            <button 
              onClick={handleSync}
              disabled={isSyncing || offlineDocs === 0}
              className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-colors shadow-sm ${
                isSyncing || offlineDocs === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#FFC107] text-[#1E2336] hover:bg-[#F2B705]'
              }`}
            >
              <RefreshCcw size={20} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? 'Synchronizing...' : offlineDocs === 0 ? 'Up to date' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
