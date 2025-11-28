
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowLeft, Users, Activity, Database, Settings, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'frameworks' | 'settings'>('overview');

  // MOCK DATA
  const stats = [
    { label: 'Total Users', value: '1,248', change: '+12%', icon: <Users size={20} className="text-blue-500" /> },
    { label: 'Active Sessions', value: '86', change: '+5%', icon: <Activity size={20} className="text-green-500" /> },
    { label: 'Frameworks', value: '24', change: '0%', icon: <Database size={20} className="text-purple-500" /> },
    { label: 'API Calls (24h)', value: '14.2k', change: '+22%', icon: <Settings size={20} className="text-orange-500" /> },
  ];

  const mockUsers = [
    { id: 1, name: 'Alice Freeman', email: 'alice@example.com', role: 'User', status: 'Active', lastActive: '2 mins ago' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Active', lastActive: '1 hour ago' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
    { id: 4, name: 'David Lee', email: 'david@example.com', role: 'User', status: 'Suspended', lastActive: '2 weeks ago' },
    { id: 5, name: 'Admin User', email: 'admin@thinktank.com', role: 'Admin', status: 'Active', lastActive: 'Now' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="group flex items-center text-stone-400 hover:text-ink mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-xs uppercase tracking-wider">Exit Dashboard</span>
          </button>
          <h1 className="text-3xl font-serif text-ink flex items-center gap-3">
            <Shield size={28} className="text-ink" /> 
            Admin Console
          </h1>
          <p className="text-stone-500 mt-1">System overview and management for {user.name}.</p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
           System Operational
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-stone-200">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
          { id: 'users', label: 'User Management', icon: <Users size={16} /> },
          { id: 'frameworks', label: 'Framework Registry', icon: <Database size={16} /> },
          { id: 'settings', label: 'System Settings', icon: <Settings size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id 
                ? 'border-ink text-ink' 
                : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-stone-50 rounded-lg">{stat.icon}</div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-ink mb-1">{stat.value}</div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-8">
               <h3 className="text-lg font-serif text-ink mb-4">Recent System Alerts</h3>
               <div className="space-y-4">
                 <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <div className="text-sm font-bold text-yellow-800">High API Latency Detected</div>
                      <div className="text-xs text-yellow-700 mt-1">Response times for Gemini 2.5 Flash exceeded 800ms between 04:00 - 04:15 UTC.</div>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
                    <div>
                      <div className="text-sm font-bold text-blue-800">System Backup Completed</div>
                      <div className="text-xs text-blue-700 mt-1">Daily database snapshot verified successfully at 00:00 UTC.</div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
           <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-stone-50/50">
               <div className="relative w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                 <input type="text" placeholder="Search users..." className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-stone-400" />
               </div>
               <div className="flex gap-2">
                 <button className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-600 uppercase tracking-wider hover:bg-stone-50">Filter</button>
                 <button className="px-3 py-2 bg-ink text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-800">Export CSV</button>
               </div>
             </div>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-wider">
                   <th className="p-4 border-b border-stone-200">User</th>
                   <th className="p-4 border-b border-stone-200">Role</th>
                   <th className="p-4 border-b border-stone-200">Status</th>
                   <th className="p-4 border-b border-stone-200">Last Active</th>
                   <th className="p-4 border-b border-stone-200 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="text-sm text-stone-600">
                 {mockUsers.map(u => (
                   <tr key={u.id} className="hover:bg-stone-50/50 transition-colors border-b border-stone-100 last:border-0">
                     <td className="p-4">
                       <div className="font-medium text-ink">{u.name}</div>
                       <div className="text-xs text-stone-400">{u.email}</div>
                     </td>
                     <td className="p-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                         {u.role}
                       </span>
                     </td>
                     <td className="p-4">
                        <span className={`flex items-center gap-1.5 ${u.status === 'Active' ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {u.status}
                        </span>
                     </td>
                     <td className="p-4 text-stone-500">{u.lastActive}</td>
                     <td className="p-4 text-right">
                       <button className="text-stone-400 hover:text-ink font-medium text-xs">Edit</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {/* FRAMEWORKS TAB */}
        {activeTab === 'frameworks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white border border-stone-200 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] border-dashed">
               <Database size={48} className="text-stone-300 mb-4" />
               <h3 className="text-lg font-serif text-ink mb-2">Framework Registry</h3>
               <p className="text-stone-500 text-sm max-w-xs mb-6">
                 Manage the curated list of frameworks available in the Methodology Library.
               </p>
               <button className="px-6 py-3 bg-stone-100 text-stone-600 rounded-lg text-sm font-bold hover:bg-stone-200 transition-colors">
                 Manage Library JSON
               </button>
             </div>
             
             <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
               <h4 className="text-sm font-bold uppercase text-stone-400 tracking-wider mb-4">Quick Stats</h4>
               <ul className="space-y-3 text-sm">
                 <li className="flex justify-between">
                   <span className="text-stone-600">Total Frameworks</span>
                   <span className="font-medium text-ink">8</span>
                 </li>
                 <li className="flex justify-between">
                   <span className="text-stone-600">Most Popular</span>
                   <span className="font-medium text-ink">Six Thinking Hats</span>
                 </li>
                 <li className="flex justify-between">
                   <span className="text-stone-600">Avg Session Time</span>
                   <span className="font-medium text-ink">24m 12s</span>
                 </li>
               </ul>
             </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
           <div className="bg-white border border-stone-200 rounded-xl p-8 max-w-2xl">
              <h3 className="text-xl font-serif text-ink mb-6">System Configuration</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                  <div>
                    <div className="font-medium text-ink">Maintenance Mode</div>
                    <div className="text-xs text-stone-500 mt-1">Prevents new sessions from starting. Existing sessions remain active.</div>
                  </div>
                  <div className="w-11 h-6 bg-stone-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                  <div>
                    <div className="font-medium text-ink">Public Registration</div>
                    <div className="text-xs text-stone-500 mt-1">Allow new users to sign up via the homepage.</div>
                  </div>
                  <div className="w-11 h-6 bg-ink rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                  <div>
                    <div className="font-medium text-ink">Debug Logging</div>
                    <div className="text-xs text-stone-500 mt-1">Enable verbose logging for API calls to Gemini.</div>
                  </div>
                  <div className="w-11 h-6 bg-stone-200 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                  </div>
                </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};
