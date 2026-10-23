import React from 'react';
import { 
  Eye, 
  Sparkles, 
  Recycle, 
  HeartHandshake, 
  BarChart3, 
  History, 
  Info, 
  CheckCircle2, 
  Cpu, 
  Menu, 
  X,
  Leaf
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen, healthStatus }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Leaf },
    { id: 'scanner', label: 'AI Waste Scanner', icon: Eye, badge: 'YOLOv8' },
    { id: 'segregation', label: 'Smart Segregation', icon: Recycle },
    { id: 'rescue', label: 'Food Rescue', icon: HeartHandshake, badge: 'NutriFeast' },
    { id: 'analytics', label: 'Waste Analytics', icon: BarChart3 },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  const handleSelect = (id) => {
    setCurrentTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-eco-surface/90 border-r border-eco-border backdrop-blur-xl p-5 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 border-b border-eco-border">
        <div 
          onClick={() => handleSelect('overview')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-green to-eco-emerald flex items-center justify-center shadow-lg shadow-eco-green/20 group-hover:scale-105 transition-transform">
            <Eye className="w-6 h-6 text-eco-bg" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg text-eco-text tracking-tight flex items-center gap-1">
              NutriFeast <span className="text-eco-green font-light">EcoVision</span>
            </h1>
            <p className="text-[11px] text-eco-muted font-medium tracking-wide">
              AI Waste Intelligence
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        {setMobileOpen && (
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-eco-muted hover:text-eco-text p-1"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-eco-muted uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-eco-card text-eco-green font-semibold shadow-md shadow-black/20 border border-eco-green/30'
                  : 'text-eco-muted hover:text-eco-text hover:bg-eco-card/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-eco-green' : 'text-eco-muted group-hover:text-eco-text'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-eco-green/20 text-eco-green border border-eco-green/30' 
                    : 'bg-eco-surface text-eco-muted border border-eco-border'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="pt-4 border-t border-eco-border">
        <div className="p-3.5 rounded-xl bg-eco-card/80 border border-eco-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-eco-text flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-eco-green" /> Vision Engine
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              healthStatus?.yolo_ready 
                ? 'bg-eco-green/15 text-eco-green' 
                : 'bg-eco-amber/15 text-eco-amber'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                healthStatus?.yolo_ready ? 'bg-eco-green animate-pulse' : 'bg-eco-amber'
              }`} />
              {healthStatus?.yolo_ready ? 'YOLOv8 Active' : 'Checking'}
            </span>
          </div>
          <div className="text-[11px] text-eco-muted space-y-0.5">
            <p>Mode: <span className="text-eco-text">Edge / CPU Local</span></p>
            <p>Database: <span className="text-eco-text">SQLite Local</span></p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block w-72 h-screen sticky top-0 flex-shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
