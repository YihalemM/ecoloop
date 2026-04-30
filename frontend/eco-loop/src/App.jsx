import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ScannerDashboard from './pages/ScannerDashboard';
import AdminPanel from './pages/AdminPanel';
import ManufacturerPortal from './pages/ManufacturerPortal';
import RewardsPage from './pages/RewardsPage';
import './index.css';

import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-primary selection:text-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/scanner" element={<ScannerDashboard />} />
            <Route path="/manufacturer" element={<ManufacturerPortal />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/rewards" element={<RewardsPage />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
