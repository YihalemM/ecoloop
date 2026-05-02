import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Barcode, 
  CheckCircle2, 
  Factory, 
  Printer, 
  AlertTriangle, 
  AlertCircle, 
  BarChart3, 
  Recycle,
  Users,
  Target,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useWallet } from '../context/WalletContext';
import { ecoApi } from '../services/api';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ec4899'];

const STATIC_ANALYTICS = {
  manufacturerName: 'EcoCorp Global',
  totalGenerated: 12450,
  totalRecycled: 8920,
  totalCo2Saved: '1542.40',
  topDeposer: { address: '0x71C123...4e2', count: 452 },
  materialStats: [
    { material: 'PET Plastic', count: 5400 },
    { material: 'HDPE Plastic', count: 2100 },
    { material: 'Glass', count: 820 },
    { material: 'Aluminum', count: 600 },
  ],
  regionalData: [
    { name: 'North Hub', value: 2450 },
    { name: 'East Center', value: 3100 },
    { name: 'West Station', value: 1800 },
    { name: 'South Point', value: 1570 },
  ]
};

const ManufacturerPortal = () => {
  const { address } = useWallet();
  const [activeTab, setActiveTab] = useState('mint'); // 'mint' or 'analytics'
  const [brand, setBrand] = useState('Coca-Cola');
  const [description, setDescription] = useState('500ml Sparkling Water');
  const [material, setMaterial] = useState('PET Plastic');
  const [count, setCount] = useState(10);
  const [co2, setCo2] = useState(12.5);
  const [isMinting, setIsMinting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [mintedBottles, setMintedBottles] = useState([]);
  const [error, setError] = useState(null);
  
  // Stats State (Using static for now as requested)
  const [stats, setStats] = useState(STATIC_ANALYTICS);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    // Keep it static for now as per user request
    setStats(STATIC_ANALYTICS);
  }, [address, activeTab]);

  const fetchStats = async () => {
    // Static bypass
    setStats(STATIC_ANALYTICS);
  };

  const handleMint = async (e) => {
    e.preventDefault();
    setIsMinting(true);
    setError(null);
    try {
      const data = await ecoApi.mintBottles(brand, count, co2, description, material, address);
      setMintedBottles(data.bottles);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMinting(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await ecoApi.registerManufacturer(address, brand);
      setError(null);
      alert('Manufacturer registered! You can now mint barcodes.');
    } catch (err) {
      alert(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Factory size={32} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Manufacturer Portal</h1>
              <p className="text-slate-400 text-sm">Enterprise circular economy management system.</p>
            </div>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
             <button 
               onClick={() => setActiveTab('mint')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'mint' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
             >
               <Plus size={16} />
               Minting
             </button>
             <button 
               onClick={() => setActiveTab('analytics')}
               className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-primary text-black' : 'text-slate-400 hover:text-white'}`}
             >
               <BarChart3 size={16} />
               Analytics
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'mint' ? (
            <motion.div 
              key="mint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Minting Form */}
              <div className="lg:col-span-2 glass-card p-8 border-white/5 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Plus size={20} className="text-primary" />
                  Register New Batch
                </h3>
                
                {!address ? (
                  <AuthAlert message="Wallet Not Connected" sub="Connect your manufacturer wallet to access this portal." type="warning" />
                ) : error?.includes('not a registered manufacturer') ? (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 space-y-4">
                     <div className="flex items-center gap-2 font-bold text-sm">
                        <AlertCircle size={18} />
                        Unauthorized Address
                     </div>
                     <p className="text-xs leading-relaxed opacity-80">
                        Your wallet <strong>{address.substring(0, 8)}...</strong> is not whitelisted.
                     </p>
                     <button 
                       onClick={handleRegister}
                       disabled={isRegistering}
                       className="w-full py-3 bg-red-500 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
                     >
                       {isRegistering ? 'Registering...' : 'Register as Manufacturer'}
                     </button>
                  </div>
                ) : (
                  <form onSubmit={handleMint} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Brand / Manufacturer</label>
                        <input 
                          type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                          placeholder="e.g. Coca-Cola" required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Material Type</label>
                        <select 
                          value={material} onChange={(e) => setMaterial(e.target.value)}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                        >
                          <option value="PET Plastic">PET Plastic</option>
                          <option value="HDPE Plastic">HDPE Plastic</option>
                          <option value="Glass">Glass</option>
                          <option value="Aluminum">Aluminum</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase">Product Description</label>
                      <textarea 
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 min-h-[80px]"
                        placeholder="e.g. 500ml Recyclable Plastic Bottle" required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Generation Quantity</label>
                        <input 
                          type="number" value={count} onChange={(e) => setCount(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                          placeholder="e.g. 50" required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">CO2 Savings (kg/unit)</label>
                        <input 
                          type="number" step="0.1" value={co2} onChange={(e) => setCo2(Number(e.target.value))}
                          className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={isMinting}
                      className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:scale-[1.02] transition-transform glow-primary disabled:opacity-50"
                    >
                      {isMinting ? 'Minting on Blockchain...' : 'Generate & Register Barcodes'}
                    </button>
                  </form>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="glass-card p-6 border-white/5 bg-primary/5 border-primary/10">
                   <div className="flex items-center gap-3 mb-4">
                      <Package className="text-primary" size={20} />
                      <h4 className="font-bold text-sm">Batch Summary</h4>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Units to Generate</span>
                        <span className="font-bold text-white">{count} Units</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Rewards Escrow</span>
                        <span className="font-bold text-primary">{count * 50} ECO</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Env. Impact Projection</span>
                        <span className="font-bold text-emerald-400">+{ (count * co2).toFixed(1) }kg CO2</span>
                      </div>
                   </div>
                </div>

                <div className="glass-card p-6 border-white/5 space-y-4">
                   <h4 className="font-bold text-sm">Trust Layer</h4>
                   <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-400/5 p-2 rounded-lg border border-emerald-400/10">
                      <CheckCircle2 size={14} />
                      PROTOCOL: ECO_VERIFY_V3
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed">
                     Every minted barcode represents a unique asset on the EcoLedger. Real-time verification ensures zero-duplication and authenticated recycling.
                   </p>
                </div>
              </div>

              {/* Recently Minted */}
              {mintedBottles.length > 0 && (
                <div className="lg:col-span-3 glass-card border-white/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                     <h3 className="font-bold text-sm">Recent Batch Output</h3>
                     <button className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">
                       <Printer size={14} /> Print Labels
                     </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-white/5">
                     {mintedBottles.map((bottle) => (
                       <div key={bottle.barcode} className="bg-slate-950 p-4 space-y-2">
                          <div className="p-2 bg-white rounded flex flex-col items-center gap-1">
                             <Barcode className="text-black w-full" size={24} />
                             <span className="text-[8px] font-mono text-black font-bold">{bottle.barcode}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 text-center font-bold">{bottle.brand}</p>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {loadingStats ? (
                <div className="h-64 flex items-center justify-center text-slate-500 font-mono text-sm">
                  Fetching Enterprise Data...
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <AnalyticCard title="Total Minted" value={stats?.totalGenerated || 0} icon={<Package />} color="blue" />
                     <AnalyticCard title="Properly Disposed" value={stats?.totalRecycled || 0} icon={<Recycle />} color="emerald" trend={`${((stats?.totalRecycled / (stats?.totalGenerated || 1)) * 100).toFixed(1)}% Rate`} />
                     <AnalyticCard title="CO2 Recovered" value={`${stats?.totalCo2Saved || 0}kg`} icon={<Target />} color="primary" />
                     <AnalyticCard title="Top Region" value={stats?.regionalData?.[0]?.name || 'N/A'} icon={<MapPin />} color="yellow" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Disposal Area Chart */}
                    <div className="glass-card p-8 border-white/5 space-y-6">
                       <h3 className="text-lg font-bold">Disposal Area Distribution</h3>
                       <div className="h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={stats?.regionalData || []}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                             <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                             <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                             <Tooltip 
                               cursor={{fill: '#ffffff05'}}
                               contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                             />
                             <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                    </div>

                    {/* Material Mix */}
                    <div className="glass-card p-8 border-white/5 space-y-6">
                       <h3 className="text-lg font-bold">Material Recycling Mix</h3>
                       <div className="flex flex-col md:flex-row items-center gap-8">
                          <div className="h-[250px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={stats?.materialStats || []}
                                  innerRadius={60} outerRadius={80} paddingAngle={5}
                                  dataKey="count" nameKey="material"
                                >
                                  {(stats?.materialStats || []).map((_, i) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-full md:w-1/2 space-y-4">
                             {(stats?.materialStats || []).map((m, i) => (
                               <div key={m.material} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                     <span className="text-slate-400">{m.material}</span>
                                  </div>
                                  <span className="font-bold">{m.count} Units</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Top Deposer */}
                  <div className="glass-card p-8 border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                           <Users size={32} className="text-yellow-500" />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-xl font-bold">Top Brand Supporter</h4>
                           <p className="text-sm text-slate-500 font-mono">{stats?.topDeposer?.address || 'N/A'}</p>
                        </div>
                     </div>
                     <div className="text-center md:text-right">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Contributions</span>
                        <span className="text-4xl font-bold text-primary">{stats?.topDeposer?.count || 0}</span>
                        <span className="text-xs text-slate-400 block mt-1">Disposed Items</span>
                     </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AnalyticCard = ({ title, value, icon, color, trend }) => (
  <div className="glass-card p-6 border-white/5 space-y-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-500`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{title}</p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
      {trend && <p className="text-[10px] text-emerald-400 font-bold mt-1">{trend}</p>}
    </div>
  </div>
);

const AuthAlert = ({ message, sub, type, onAction, actionLabel }) => (
  <div className={`p-8 rounded-2xl text-center space-y-4 ${type === 'warning' ? 'bg-yellow-500/5 border border-yellow-500/10' : 'bg-red-500/5 border border-red-500/10'}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
       <AlertTriangle size={24} />
    </div>
    <div>
      <h4 className="font-bold text-white">{message}</h4>
      <p className="text-sm text-slate-500 mt-1 mb-4">{sub}</p>
      {onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

export default ManufacturerPortal;
