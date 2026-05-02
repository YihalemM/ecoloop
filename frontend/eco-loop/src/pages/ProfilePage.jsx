import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Trash2, 
  Leaf, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  History,
  ArrowUpRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useWallet } from '../context/WalletContext';
import { ecoApi } from '../services/api';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'];

const STATIC_PROFILE = {
  totalScanned: 42,
  totalCo2: '124.50',
  materialBreakdown: [
    { material: 'PET Plastic', count: 28 },
    { material: 'HDPE Plastic', count: 8 },
    { material: 'Glass', count: 4 },
    { material: 'Aluminum', count: 2 },
  ],
  recentActivity: [
    { barcode: 'ECO-A1B2C3D4', material: 'PET Plastic', brand: 'Coca-Cola', co2: 12.5, timestamp: Date.now() - 86400000 },
    { barcode: 'ECO-E5F6G7H8', material: 'HDPE Plastic', brand: 'Sprite', co2: 8.2, timestamp: Date.now() - 172800000 },
    { barcode: 'ECO-I9J0K1L2', material: 'PET Plastic', brand: 'WaterCo', co2: 12.5, timestamp: Date.now() - 259200000 },
    { barcode: 'ECO-M3N4O5P6', material: 'Aluminum', brand: 'Pepsi', co2: 15.0, timestamp: Date.now() - 345600000 },
    { barcode: 'ECO-Q7R8S9T0', material: 'Glass', brand: 'LocalBrew', co2: 25.0, timestamp: Date.now() - 432000000 },
  ]
};

const ProfilePage = () => {
  const { address, balance, fetchBalance } = useWallet();
  const [profileData, setProfileData] = useState(STATIC_PROFILE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Static for now
    setProfileData(STATIC_PROFILE);
  }, [address]);

  const fetchProfile = async () => {
    setProfileData(STATIC_PROFILE);
  };

  const handleWithdraw = async (currency) => {
    if (Number(balance) < 500) {
      alert("Minimum withdrawal is 500 ECO ($1).");
      return;
    }

    const confirm = window.confirm(`Confirm withdrawal of ${balance} ECO to ${currency}?`);
    if (!confirm) return;

    try {
      await ecoApi.withdraw(address, balance, currency, currency === 'ETB' ? 'Chapa/Telebirr' : 'MetaMask');
      alert(`Withdrawal successful! Your ${currency} will arrive shortly.`);
      fetchProfile(); // Refresh profile data
      fetchBalance(address); // Refresh global balance
    } catch (err) {
      alert("Withdrawal failed: " + err.message);
    }
  };

  if (!address) {
    return (
      <div className="pt-32 pb-20 px-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-slate-500" />
          </div>
          <h1 className="text-2xl font-bold">Wallet Not Connected</h1>
          <p className="text-slate-400 max-w-xs mx-auto">Connect your wallet to view your environmental impact and collected rewards.</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="pt-32 px-8 min-h-screen">Loading Profile...</div>;

  return (
    <div className="pt-32 pb-20 px-8 min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Globe size={14} />
              Sustainability Citizen
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Environmental Dashboard</h1>
            <p className="text-slate-400 font-mono text-sm">{address}</p>
          </div>
          
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Impact Score</span>
                <span className="text-xl font-bold text-white">{(profileData?.totalScanned * 12.4).toFixed(0)} XP</span>
             </div>
             <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl">
                <span className="text-[10px] text-primary font-bold uppercase block mb-1">Rank</span>
                <span className="text-xl font-bold text-primary">Eco Guardian</span>
             </div>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            icon={<Coins className="text-yellow-500" />}
            label="Total ECO Collected"
            value={`${balance} ECO`}
            trend="+12% this month"
            color="yellow"
          />
          <StatCard 
            icon={<div className="text-emerald-400 font-bold">$</div>}
            label="Monetary Value"
            value={`$${(Number(balance) / 500).toFixed(2)}`}
            trend={`${(Number(balance) / 500 * 120).toFixed(0)} Birr (ETB)`}
            color="emerald"
          />
          <StatCard 
            icon={<Trash2 className="text-blue-500" />}
            label="Items Disposed"
            value={profileData?.totalScanned || 0}
            trend="Ranked #42 in area"
            color="blue"
          />
          <StatCard 
            icon={<Leaf className="text-primary" />}
            label="CO2 Offset"
            value={`${profileData?.totalCo2 || 0} kg`}
            trend="Saved 2 trees today"
            color="emerald"
          />
        </div>

        {/* Withdrawal Section */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8"
        >
           <div className="space-y-2">
              <h3 className="text-2xl font-bold">Ready to Cash Out?</h3>
              <p className="text-slate-400 max-w-md">You have <strong>{(Number(balance) / 500 * 120).toFixed(2)} Birr</strong> available for withdrawal. Choose your preferred currency and method below.</p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => handleWithdraw('ETB')}
                className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl"
              >
                Withdraw Birr
              </button>
              <button 
                onClick={() => handleWithdraw('USDC')}
                className="px-8 py-4 bg-primary text-black font-bold rounded-2xl hover:scale-105 transition-transform glow-primary"
              >
                Withdraw USDC
              </button>
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-card p-8 border-white/5 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Environmental Impact Trend
              </h3>
              <select className="bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-1 outline-none">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateMockImpactData(profileData?.totalCo2 || 0)}>
                  <defs>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#22c55e" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Breakdown Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 border-white/5 space-y-6"
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PieChartIcon size={20} className="text-blue-500" />
              Material Distribution
            </h3>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={profileData?.materialBreakdown?.length > 0 ? profileData.materialBreakdown : [{material: 'None', count: 1}]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="material"
                  >
                    {(profileData?.materialBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {(!profileData?.materialBreakdown || profileData.materialBreakdown.length === 0) && (
                       <Cell fill="#1e293b" />
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
               {profileData?.materialBreakdown?.map((m, i) => (
                 <div key={m.material} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-slate-400">{m.material}</span>
                    </div>
                    <span className="font-bold">{m.count} items</span>
                 </div>
               ))}
               {!profileData?.materialBreakdown?.length && (
                  <p className="text-xs text-slate-500 text-center italic">No items scanned yet.</p>
               )}
            </div>
          </motion.div>
        </div>

        {/* Activity Table */}
        <div className="glass-card border-white/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History size={20} className="text-slate-400" />
              Recent Disposal History
            </h3>
            <button className="text-xs text-primary font-bold hover:underline">View All Activity</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Item</th>
                  <th className="px-8 py-4">Material</th>
                  <th className="px-8 py-4">Brand</th>
                  <th className="px-8 py-4">CO2 Saved</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profileData?.recentActivity?.map((act) => (
                  <tr key={act.barcode} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-4 font-bold text-sm">Bottle #{act.barcode.slice(-4)}</td>
                    <td className="px-8 py-4 text-sm text-slate-400">{act.material}</td>
                    <td className="px-8 py-4 text-sm text-slate-400">{act.brand}</td>
                    <td className="px-8 py-4 text-sm text-emerald-400 font-bold">+{act.co2}kg</td>
                    <td className="px-8 py-4 text-sm text-slate-500">{new Date(act.timestamp).toLocaleDateString()}</td>
                    <td className="px-8 py-4 text-right">
                      <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded-md">Verified</span>
                    </td>
                  </tr>
                ))}
                {!profileData?.recentActivity?.length && (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-slate-500 italic text-sm">
                      No activity found. Start scanning to see your history!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 border-white/5 flex items-start gap-4"
  >
    <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="space-y-1">
      <p className="text-xs text-slate-500 font-bold uppercase">{label}</p>
      <h4 className="text-2xl font-bold">{value}</h4>
      <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
        <ArrowUpRight size={10} className="text-primary" />
        {trend}
      </p>
    </div>
  </motion.div>
);

const generateMockImpactData = (total) => {
  const data = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let current = total * 0.4;
  for (let i = 0; i < 7; i++) {
    current += Math.random() * (total * 0.1);
    data.push({ name: days[i], co2: parseFloat(current.toFixed(1)) });
  }
  return data;
};

export default ProfilePage;
