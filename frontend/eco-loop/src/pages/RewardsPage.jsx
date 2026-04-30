import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Award, TrendingUp, ShoppingBag, ArrowRight, Zap, Wallet } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const RewardsPage = () => {
  const { address, balance } = useWallet();
  const redeemables = [
    { name: 'Public Transit Pass', cost: 500, image: '🚌', category: 'Travel' },
    { name: 'Eco-Friendly Water Bottle', cost: 300, image: '💧', category: 'Product' },
    { name: 'Tree Planting Donation', cost: 100, image: '🌳', category: 'Impact' },
    { name: 'Solar Charger Kit', cost: 1200, image: '☀️', category: 'Tech' },
  ];

  const leaderboard = [
    { rank: 1, user: '0x88A...3f2', points: 15400, level: 'Master Recycler' },
    { rank: 2, user: '0x71C...4e2', points: 12550, level: 'Elite' },
    { rank: 3, user: '0x44B...9a1', points: 9800, level: 'Eco-Warrior' },
    { rank: 4, user: '0x22F...bc4', points: 7200, level: 'Contributor' },
  ];

  return (
    <div className="pt-24 pb-20 px-8 min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Rewards & Impact</h1>
            <p className="text-slate-400">Redeem your ECO tokens for sustainable products and positive impact.</p>
          </div>
          <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl">
            <div className="p-2 rounded-xl bg-primary text-black"><Wallet size={20} /></div>
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Your Balance</p>
               <p className="font-bold text-lg text-primary">{balance} ECO</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
             <ShoppingBag size={20} className="text-primary" />
             Available Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {redeemables.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="glass-card p-6 border-white/5 space-y-4 group"
              >
                <div className="text-4xl bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                  {item.image}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.category}</span>
                  <h4 className="font-bold text-lg">{item.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 text-primary font-bold">
                     <Zap size={14} />
                     {item.cost} ECO
                  </div>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                    Redeem <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RewardsPage;
