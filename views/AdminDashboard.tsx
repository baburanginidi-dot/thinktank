
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowLeft, Users, Activity, Database, Settings, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'frameworks' | 'settings'>('overview');

  const stats = [
    { label: 'Total Users', value: '1,248', change: '+12%', icon: <Users size={20} className="text-blue-500" /> },
    { label: 'Active Sessions', value: '86', change: '+5%', icon: <Activity size={20} className="text-green-500" /> },
    { label: 'Frameworks', value: '24', change: '0%', icon: <Database size={20} className="text-purple-500" /> },
  ];

  return (
    <div className="w-full px-4 py-6 animate-fade-in-up pb-safe overflow-x-hidden">
      
      <div className="flex flex-col mb-6 gap-4">
        <div>
          <button onClick={onBack} className="group flex items-center text-stone-400 hover:text-ink mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            <span className="font-medium text-xs uppercase tracking-wider">Exit</span>
          </button>
          <h1 className="text-2xl font-serif text-ink flex items-center gap-3">
            <Shield size={24} className="text-ink" /> Admin
          </h1>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide self-start">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
           Operational
        </div>
      </div>

      <div className="flex gap-1 mb-8 border-b border-stone-200 overflow-x-auto custom-scrollbar pb-1 -mx-4 px-4">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
          { id: 'users', label: 'Users', icon: <Users size={16} /> },
          { id: 'frameworks', label: 'Frameworks', icon: <Database size={16} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id ? 'border-ink text-ink' : 'border-transparent text-stone-500'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold text-ink">{stat.value}</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">{stat.icon}</div>
                </div>
              ))}
            </div>
            
            <div className="bg-white border border-stone-200 rounded-xl p-6">
               <h3 className="text-lg font-serif text-ink mb-4">Alerts</h3>
               <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                  <div className="text-xs text-yellow-800 font-medium">High API Latency (800ms)</div>
               </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
           <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-stone-200 bg-stone-50/50">
               <input type="text" placeholder="Search..." className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm" />
             </div>
             <div className="p-4 text-center text-stone-400 text-sm italic">User list simplified for mobile preview.</div>
           </div>
        )}
      </div>
    </div>
  );
};
