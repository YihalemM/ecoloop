import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scan, 
  CheckCircle,
  Cpu,
  ChevronRight,
  AlertCircle,
  XCircle,
  Barcode as BarcodeIcon,
  Activity,
  History
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { ecoApi } from '../services/api';


const ScannerDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanResult, setScanResult] = useState(null);

  const { address: userAddress, fetchBalance } = useWallet();
  const [bottleDetails, setBottleDetails] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await ecoApi.getLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!barcodeInput && !isScanning) return;

    setIsScanning(true);
    setScanResult(null);

    setTimeout(async () => {
      try {
        const data = await ecoApi.scanBottle(barcodeInput || 'BOTTLE-001', userAddress);
        
        setScanResult({ status: 'success', message: data.message });
        setBottleDetails(data.bottle);
        fetchLogs();
        fetchBalance(userAddress); // Refresh balance immediately
        setBarcodeInput('');
      } catch (err) {
        setScanResult({ status: 'error', message: err.message || 'Connection to backend failed.' });
        setBottleDetails(null);
      } finally {
        setIsScanning(false);
      }
    }, 1200);
  };

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Scan size={24} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Verification Terminal</h1>
           </div>
           <p className="text-sm text-slate-400">Scan or enter bottle identifiers to claim your EcoReward distribution.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Scanner Section */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-card border-white/5 p-4 relative overflow-hidden aspect-video max-h-[500px]">
              <div className="absolute top-6 left-6 z-10 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SECURE TERMINAL ACTIVE
              </div>
              
              <div className="w-full h-full rounded-2xl bg-slate-900/50 flex items-center justify-center relative overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&q=80&w=1000" 
                  alt="Scanning Preview" 
                  className={`w-full h-full object-cover opacity-20 grayscale ${isScanning ? 'scale-105 blur-md' : 'scale-100'} transition-all duration-1000`}
                />
                
                {/* Scanner Target Area */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-56 h-56 border border-white/10 rounded-3xl relative">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary rounded-tl-3xl shadow-[-5px_-5px_15px_rgba(34,197,94,0.3)]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary rounded-tr-3xl shadow-[5px_-5px_15px_rgba(34,197,94,0.3)]" />
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary rounded-bl-3xl shadow-[-5px_5px_15px_rgba(34,197,94,0.3)]" />
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary rounded-br-3xl shadow-[5px_5px_15px_rgba(34,197,94,0.3)]" />
                    
                    {isScanning && (
                      <motion.div 
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_20px_#22c55e,0_0_40px_#22c55e]"
                      />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center">
                       <BarcodeIcon size={48} className={`text-white/5 transition-colors ${isScanning ? 'text-primary/20' : ''}`} />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 flex gap-4">
                   <div className="px-4 py-2 glass-card border-white/10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                     FPS: 60.0
                   </div>
                   <div className="px-4 py-2 glass-card border-white/10 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                     Resolution: 1080p
                   </div>
                </div>
              </div>
            </div>

            {/* Input Overlay */}
            <div className="glass-card border-white/5 p-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
               <h3 className="font-bold text-sm mb-4 uppercase tracking-widest text-slate-400">Manual Identifier Entry</h3>
               <form onSubmit={handleScan} className="flex gap-4">
                  <div className="flex-1 relative">
                     <input 
                       type="text" 
                       placeholder="ENTER BARCODE (e.g. ECO-XXXXXX)" 
                       value={barcodeInput}
                       onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                       className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-primary/50 font-mono tracking-widest transition-all"
                     />
                     <BarcodeIcon className="absolute right-5 top-4 text-slate-600" size={20} />
                  </div>
                  <button 
                    type="submit"
                    disabled={isScanning}
                    className="px-10 bg-primary text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all glow-primary disabled:opacity-50 min-w-[160px] uppercase text-xs tracking-widest"
                  >
                    {isScanning ? 'Verifying...' : 'Redeem Now'}
                  </button>
               </form>

               <AnimatePresence>
                 {scanResult && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className={`mt-6 p-4 rounded-xl flex items-center gap-3 border ${
                       scanResult.status === 'success' 
                         ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                         : 'bg-red-500/10 border-red-500/20 text-red-400'
                     }`}
                   >
                     {scanResult.status === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                     <span className="text-sm font-bold tracking-tight">{scanResult.message}</span>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Sidebar - Bottle Details (Simplified) */}
          <div className="lg:col-span-4 space-y-6">
             <div className="glass-card border-white/5 p-8 space-y-6 min-h-[400px] flex flex-col justify-center items-center text-center">
                {!bottleDetails ? (
                   <div className="space-y-4 opacity-40">
                      <BarcodeIcon size={48} className="mx-auto" />
                      <p className="text-xs font-bold uppercase tracking-widest">Waiting for Scan...</p>
                   </div>
                ) : (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="space-y-6 w-full"
                   >
                      <div className="space-y-1">
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Verified Product</span>
                        <h2 className="text-2xl font-bold">{bottleDetails.brand}</h2>
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl text-left space-y-4 border border-white/5">
                         <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Description</p>
                            <p className="text-sm leading-relaxed">{bottleDetails.description}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Material</p>
                               <p className="text-sm font-bold">{bottleDetails.material}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Impact</p>
                               <p className="text-sm font-bold text-emerald-400">+{bottleDetails.co2}kg CO2</p>
                            </div>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Manufacturer</p>
                            <p className="text-sm font-mono text-slate-300">{bottleDetails.manufacturer}</p>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 justify-center text-emerald-400 font-bold text-xs">
                         <CheckCircle size={16} />
                         REWARD ISSUED: 50 ECO
                      </div>
                   </motion.div>
                )}
             </div>

             {/* Minimal History */}
             <div className="glass-card border-white/5 p-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                   <History size={14} /> Recent Session
                </h4>
                <div className="space-y-3">
                   {logs.slice(0, 3).map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold">{log.name}</span>
                         <span className="font-mono text-slate-600">{log.id}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-center text-[10px]">
     <span className="text-slate-500 font-bold uppercase tracking-tight">{label}</span>
     <span className="text-slate-300 font-mono font-bold">{value}</span>
  </div>
);

export default ScannerDashboard;
