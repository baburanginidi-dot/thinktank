import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Users, Activity, Database, Settings, Shield, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { api } from '../services/api';

interface AdminDashboardProps {
  user: User;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'frameworks' | 'settings'>('overview');
  const [stats, setStats] = useState({ totalUsers: 0, activeSessions: 0, frameworks: 24 });
  const [activity, setActivity] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activityData, usersData] = await Promise.all([
          api.getAdminStats(),
          api.getAdminActivity(),
          api.getAdminUsers()
        ]);
        setStats(statsData);
        setActivity(activityData);
        setAdminUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, change: '+12%', icon: <Users size={20} className="text-blue-500" /> },
    { label: 'Active Sessions', value: stats.activeSessions, change: '+5%', icon: <Activity size={20} className="text-green-500" /> },
    { label: 'Frameworks', value: stats.frameworks, change: '0%', icon: <Database size={20} className="text-purple-500" /> },
  ];

  return (
    <div className="w-full px-4 md:px-12 lg:px-20 py-6 md:py-12 animate-fade-in-up pb-safe overflow-x-hidden max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button onClick={onBack} className="group flex items-center text-stone-400 hover:text-ink mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            <span className="font-medium text-xs uppercase tracking-wider">Exit</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-serif text-ink flex items-center gap-3">
            <Shield size={28} className="text-ink" /> Admin Dashboard
          </h1>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide self-start md:self-auto">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
           System Operational
        </div>
      </div>

      <div className="flex gap-1 mb-8 border-b border-stone-200 overflow-x-auto custom-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
          { id: 'users', label: 'Users', icon: <Users size={16} /> },
          { id: 'frameworks', label: 'Frameworks', icon: <Database size={16} /> },
          { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.id ? 'border-ink text-ink' : 'border-transparent text-stone-500'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statCards.map((stat, idx) => (
                <div key={idx} className="bg-white border border-stone-200 p-6 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{stat.label}</div>
                    <div className="text-3xl font-bold text-ink">{stat.value}</div>
                    <div className="text-xs font-medium text-green-600 mt-1">{stat.change} from last week</div>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl">{stat.icon}</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white border border-stone-200 rounded-xl p-6">
                  <h3 className="text-lg font-serif text-ink mb-6">System Health</h3>
                  <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                      <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={24} />
                      <div>
                         <div className="text-sm text-yellow-900 font-bold mb-1">API Latency Warning</div>
                         <div className="text-xs text-yellow-700 leading-relaxed">
                           Gemini API response times averaged 800ms over the last hour.
                         </div>
                      </div>
                  </div>
               </div>
               
               <div className="bg-white border border-stone-200 rounded-xl p-6">
                 <h3 className="text-lg font-serif text-ink mb-6">Recent Activity</h3>
                 <div className="space-y-4">
                    {activity.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                         <div className={`w-2 h-2 rounded-full ${item.type === 'user_registration' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                         <span className="text-stone-500">{item.message}</span>
                         <span className="ml-auto text-xs text-stone-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {activity.length === 0 && <p className="text-stone-400 text-sm">No recent activity</p>}
                 </div>
               </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
           <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
             <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col md:flex-row gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                 <input type="text" placeholder="Search users by email or name..." className="w-full pl-10 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-stone-400 outline-none" />
               </div>
               <div className="flex gap-2">
                 <button className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-600">Filter</button>
                 <button className="px-4 py-2 bg-ink text-white rounded-lg text-xs font-semibold">Export CSV</button>
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="bg-stone-50 border-b border-stone-200">
                   <tr>
                     <th className="px-6 py-3 text-left font-semibold text-stone-600">Name</th>
                     <th className="px-6 py-3 text-left font-semibold text-stone-600">Email</th>
                     <th className="px-6 py-3 text-left font-semibold text-stone-600">Role</th>
                     <th className="px-6 py-3 text-left font-semibold text-stone-600">Joined</th>
                   </tr>
                 </thead>
                 <tbody>
                   {adminUsers.map((user) => (
                     <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50">
                       <td className="px-6 py-3">{user.name}</td>
                       <td className="px-6 py-3">{user.email}</td>
                       <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${user.is_admin ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-700'}`}>{user.is_admin ? 'Admin' : 'User'}</span></td>
                       <td className="px-6 py-3 text-stone-500 text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};