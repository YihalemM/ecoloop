import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Barcode, ShieldCheck, Coins, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="pt-24 pb-20 px-8 min-h-screen grid-bg">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 py-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            MAINNET LIVE
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Recycle. Earn.<br />
            <span className="text-primary italic">Repeat.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            Gasless Recycling Reward Platform. Harnessing the transparency of blockchain to verify every gram of diverted waste.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link to="/scanner" className="flex items-center gap-2 px-8 py-3 bg-primary text-black font-bold rounded-xl hover:scale-105 transition-transform glow-primary">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-8 py-3 bg-slate-800/50 text-white font-bold rounded-xl border border-white/5 hover:bg-slate-800 transition-colors">
              Explore Ledger
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative"
        >
          <div className="aspect-square rounded-3xl overflow-hidden glass-card p-4 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800" 
              alt="Sustainability Abstract" 
              className="w-full h-full object-cover rounded-2xl opacity-80 group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute bottom-8 right-8 px-4 py-2 glass-card border-white/10 text-[10px] font-mono text-emerald-400">
              0x71C...4e2
            </div>
          </div>
        </motion.div>
      </div>

      {/* Onboarding Section */}
      <div className="max-w-7xl mx-auto space-y-12">
        <h2 className="text-3xl font-bold text-center">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard 
            icon={<Barcode className="w-6 h-6 text-emerald-400" />}
            number="1"
            title="Scan"
            description="Scan the bottle barcode to verify its origin and material."
          />
          <StepCard 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
            number="2"
            title="Verify"
            description="Our blockchain verifies the recycling event in real-time."
          />
          <StepCard 
            icon={<Coins className="w-6 h-6 text-emerald-400" />}
            number="3"
            title="Earn"
            description="Receive ECO tokens immediately in your connected wallet."
          />
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ icon, number, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 glass-card border-white/5 space-y-4"
  >
    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
      {icon}
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-slate-300">{number}. {title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default LandingPage;
