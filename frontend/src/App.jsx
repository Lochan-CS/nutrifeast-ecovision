import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { ToastProvider, useToast } from './components/Toast';
import LandingPage from './pages/LandingPage';
import ScannerPage from './pages/ScannerPage';
import SegregationPage from './pages/SegregationPage';
import RescuePage from './pages/RescuePage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import { checkHealth } from './services/api';
import { Menu, Eye, ShieldCheck, Sparkles, Cpu, Leaf } from 'lucide-react';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    async function verifyBackend() {
      const res = await checkHealth();
      setHealthStatus(res);
    }
    verifyBackend();
    const interval = setInterval(verifyBackend, 25000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05130D] text-eco-text selection:bg-eco-green selection:text-eco-bg flex">
      {/* Fixed Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-eco-grid opacity-90">
        <div className="orb orb-1 w-[550px] h-[550px] bg-eco-green/12 top-[-100px] left-[15%]" />
        <div className="orb orb-2 w-[650px] h-[650px] bg-eco-emerald/10 bottom-[-150px] right-[5%]" />
        <div className="orb orb-3 w-[400px] h-[400px] bg-eco-lime/8 top-[40%] left-[-80px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05130D]/40 to-[#05130D]" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        healthStatus={healthStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-eco-surface/90 backdrop-blur-md border-b border-eco-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg bg-eco-card text-eco-muted hover:text-eco-text"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-eco-green flex items-center justify-center text-eco-bg">
                <Eye className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-sm tracking-tight text-eco-text">
                EcoVision
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('scanner')}
              className="px-3 py-1 rounded-lg bg-eco-green text-eco-bg font-heading font-bold text-xs"
            >
              Scan
            </button>
          </div>
        </header>

        {/* Viewport View Switcher */}
        <main className="flex-1">
          {currentTab === 'overview' && (
            <LandingPage
              onStartScan={() => setCurrentTab('scanner')}
              onExploreDashboard={() => setCurrentTab('analytics')}
            />
          )}

          {currentTab === 'scanner' && (
            <ScannerPage
              onNavigateToRescue={() => setCurrentTab('rescue')}
            />
          )}

          {currentTab === 'segregation' && (
            <SegregationPage
              onOpenScanner={() => setCurrentTab('scanner')}
            />
          )}

          {currentTab === 'rescue' && <RescuePage />}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              onOpenScanner={() => setCurrentTab('scanner')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              onOpenScanner={() => setCurrentTab('scanner')}
            />
          )}

          {currentTab === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
