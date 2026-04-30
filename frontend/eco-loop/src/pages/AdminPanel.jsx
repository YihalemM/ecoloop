import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Database, 
  ArrowUpRight, 
  Wallet,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ecoApi } from '../services/api';


const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    ecoApi.getStats().then(data => setStats(data));
    ecoApi.getEvents().then(data => setEvents(data));
  }, []);

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen grid-bg space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold">Governance Console</h1>
          <p className="text-sm text-slate-400">Administrative oversight and reward ecosystem management for Base Sapolia Testnet.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Network Health Section */}
          <div className="lg:col-span-2 glass-card border-white/5 p-8 space-y-6 flex flex-col justify-center">
             <div className="flex justify-between items-start">
               <div className="space-y-1">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network Health</p>
                 <div className="flex items-baseline gap-2">
                   <h2 className="text-4xl font-bold text-emerald-400">{stats.networkHealth || '99.9%'}</h2>
                   <span className="text-[10px] text-slate-500 font-mono">Status: ACTIVE</span>
                 </div>
               </div>
               <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                 <Activity size={24} className="text-emerald-400" />
               </div>
             </div>
             <p className="text-sm text-slate-400 leading-relaxed">
               System synchronized with Base Sepolia. All verification nodes are operational and processing events at 60 TPS.
             </p>
          </div>

          {/* Reward Pool Management */}
          <div className="glass-card border-white/5 p-8 space-y-8">
             <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Reward Pool Management</h3>
                <div className="flex justify-between items-end">
                   <div>
                     <p className="text-xs text-slate-500 mb-1">Available ECO Liquidity</p>
                     <p className="text-2xl font-bold">{stats.availableLiquidity}</p>
                   </div>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full mt-4 overflow-hidden border border-white/5">
                   <div className="w-[62%] h-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                   <span>0 ECO</span>
                   <span>Target: {stats.targetLiquidity}</span>
                </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Inbound Funding (USDC)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="0.00" 
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>
                <button className="w-full py-4 bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all uppercase tracking-widest text-xs">
                  Deposit Rewards
                </button>
             </div>

             <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-xs text-emerald-400">
                  <ShieldCheck size={16} />
                  <span>Audit Status: CLEAR</span>
                </div>
                <button className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 uppercase tracking-widest font-bold">
                  View Smart Contract <ArrowUpRight size={10} />
                </button>
             </div>
          </div>
        </div>

        {/* Event Stream */}
        <div className="mt-8 glass-card border-white/5 overflow-hidden">
           <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                 <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                   <Activity size={16} />
                 </div>
                 <h3 className="font-bold text-sm tracking-tight">ECOREWARD.SOL EVENT STREAM</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-[10px] text-slate-500 font-bold">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Base Sapolia LIVE
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   <th className="px-6 py-4">Transaction Hash</th>
                   <th className="px-6 py-4">Event Type</th>
                   <th className="px-6 py-4">Amount</th>
                   <th className="px-6 py-4">Timestamp</th>
                   <th className="px-6 py-4 text-right">Block</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {events.map((event, i) => (
                   <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                     <td className="px-6 py-4 text-xs font-mono text-emerald-400 cursor-pointer hover:underline">{event.hash}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          event.type === 'RewardMinted' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                          event.type === 'PoolWithdrawn' ? 'bg-red-500/5 border-red-500/10 text-red-400' :
                          'bg-blue-500/5 border-blue-500/10 text-blue-400'
                        }`}>
                          {event.type}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-xs font-bold text-slate-300">{event.amount}</td>
                     <td className="px-6 py-4 text-xs text-slate-500">{event.time}</td>
                     <td className="px-6 py-4 text-xs font-mono text-slate-600 text-right">{event.block}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
