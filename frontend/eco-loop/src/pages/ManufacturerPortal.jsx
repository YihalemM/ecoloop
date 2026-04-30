import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Barcode, CheckCircle2, Factory, Printer, AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { ecoApi } from '../services/api';


const ManufacturerPortal = () => {
  const { address } = useWallet();
  const [brand, setBrand] = useState('Coca-Cola');
  const [description, setDescription] = useState('500ml Sparkling Water');
  const [material, setMaterial] = useState('PET Plastic');
  const [count, setCount] = useState(10);
  const [co2, setCo2] = useState(12.5);
  const [isMinting, setIsMinting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [mintedBottles, setMintedBottles] = useState([]);
  const [error, setError] = useState(null);



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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <Factory size={32} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Manufacturer Portal</h1>
            <p className="text-slate-400">Register new production batches to the EcoLedger blockchain.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Minting Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 border-white/5 space-y-6"
          >
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Plus size={20} className="text-primary" />
              Register New Batch
            </h3>
            
            {!address ? (
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 space-y-4">
                 <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle size={18} />
                    Wallet Not Connected
                 </div>
                 <p className="text-xs leading-relaxed opacity-80">
                   You must connect your manufacturer wallet to register new bottle batches on the blockchain.
                 </p>
              </div>
            ) : error?.includes('not a registered manufacturer') ? (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 space-y-4">
                 <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle size={18} />
                    Unauthorized Address
                 </div>
                 <p className="text-xs leading-relaxed opacity-80">
                    Your wallet <strong>{address.substring(0, 8)}...</strong> is not whitelisted as a manufacturer.
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
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Brand / Manufacturer</label>
                  <input 
                    type="text" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    placeholder="e.g. Coca-Cola"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Product Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 min-h-[80px]"
                    placeholder="e.g. 500ml Recyclable Plastic Bottle"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Material Type</label>
                  <select 
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="PET Plastic">PET Plastic</option>
                    <option value="HDPE Plastic">HDPE Plastic</option>
                    <option value="Glass">Glass</option>
                    <option value="Aluminum">Aluminum</option>
                  </select>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Generation Quantity</label>
                    <input 
                      type="number" 
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                      placeholder="e.g. 50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">CO2 Savings (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={co2}
                      onChange={(e) => setCo2(Number(e.target.value))}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isMinting}
                  className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:scale-[1.02] transition-transform glow-primary disabled:opacity-50"
                >
                  {isMinting ? 'Minting on Blockchain...' : 'Generate & Register Barcodes'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Stats / Info */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-white/5 bg-primary/5 border-primary/10">
               <div className="flex items-center gap-3 mb-4">
                  <Package className="text-primary" size={20} />
                  <h4 className="font-bold text-sm">Batch Summary</h4>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Barcodes to Generate</span>
                    <span className="font-bold text-white">{count} Units</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Total Tokens to Mint</span>
                    <span className="font-bold text-primary">{count * 50} ECO</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Environmental Impact</span>
                    <span className="font-bold text-emerald-400">+{ (count * co2).toFixed(1) }kg CO2</span>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 border-white/5 space-y-4">
               <h4 className="font-bold text-sm">Blockchain Verification</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 Each barcode is a unique cryptographic identifier. Once printed, it can only be redeemed once by a consumer through a verified recycling facility.
               </p>
               <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-400/5 p-2 rounded-lg border border-emerald-400/10">
                  <CheckCircle2 size={14} />
                  SMART CONTRACT: ECO_MINT_V1
               </div>
            </div>
          </div>
        </div>

        {/* Recently Minted */}
        {mintedBottles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card border-white/5 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
               <h3 className="font-bold text-sm">Recent Batch: {brand}</h3>
               <button className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">
                 <Printer size={14} />
                 Print Labels
               </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
               {mintedBottles.map((bottle) => (
                 <div key={bottle.barcode} className="bg-slate-950 p-4 space-y-2">
                    <div className="p-2 bg-white rounded flex flex-col items-center gap-1">
                       <Barcode className="text-black w-full" size={24} />
                       <span className="text-[8px] font-mono text-black font-bold">{bottle.barcode}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center font-bold">{bottle.manufacturer}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ManufacturerPortal;
