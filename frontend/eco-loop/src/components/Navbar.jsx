import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Bell, Radio, Factory } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const Navbar = () => {
  const location = useLocation();
  const { address, balance, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Scanner', path: '/scanner' },
    { name: 'Manufacturer', path: '/manufacturer', icon: <Factory size={14} className="mr-1" /> },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Profile', path: '/profile' },
  ];

  const shortenAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
             <div className="w-4 h-4 bg-primary rounded-sm shadow-[0_0_10px_#22c55e]" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">EcoLedger</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold tracking-tight transition-all hover:text-primary flex items-center ${
                location.pathname === link.path ? 'text-primary scale-105' : 'text-slate-400'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {address && (
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-slate-900/50 border border-white/5 rounded-2xl">
             <div className="flex flex-col items-end border-r border-white/10 pr-4">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Live Balance</span>
                <span className="text-sm font-bold text-primary leading-none">{balance} ECO</span>
             </div>
             <div className="flex items-center gap-2 text-slate-300 font-mono text-xs font-bold">
                <Wallet size={14} className="text-primary" />
                {shortenAddress(address)}
             </div>
          </div>
        )}

        {address && (
          <div className="hidden lg:flex flex-col items-end border-l border-white/10 pl-6">
             <span className="text-[10px] text-emerald-400 font-bold tracking-widest leading-none mb-1">
               ≈ ${(Number(balance) / 500).toFixed(2)} USD
             </span>
             <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none">
               {(Number(balance) / 500 * 120).toFixed(2)} ETB
             </span>
          </div>
        )}

        <div className="flex items-center gap-2">
           <button className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors">
              <Bell size={18} />
           </button>
           <button 
             onClick={address ? disconnectWallet : connectWallet}
             disabled={isConnecting}
             className={`px-6 py-2.5 font-bold text-sm rounded-xl transition-all glow-primary ${
               address 
                 ? 'bg-slate-900 text-slate-400 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' 
                 : 'bg-primary text-black hover:scale-105 active:scale-95'
             }`}
           >
              {isConnecting ? 'Connecting...' : address ? 'Disconnect' : 'Connect Wallet'}
           </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
