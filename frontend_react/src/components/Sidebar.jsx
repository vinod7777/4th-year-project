import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  BrainCircuit, 
  ShieldAlert, 
  Blocks, 
  FileText, 
  Radio, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, threatActive }) {
  const menuItems = [
    { id: 'overview', label: 'City Overview', icon: LayoutDashboard, badge: 'Live' },
    { id: 'blockchain3d', label: '3D Blockchain Ledger', icon: Blocks, badge: 'Three.js' },
    { id: 'nodes', label: 'City Locations', icon: Network, badge: '10 Nodes' },
    { id: 'defense', label: 'AI & Defense Systems', icon: ShieldAlert, badge: threatActive ? 'THREAT' : 'Protected', alert: threatActive },
    { id: 'research', label: 'Research & Benchmarks', icon: FileText, badge: 'IEEE' },
  ];

  return (
    <aside 
      className={`h-screen bg-[#070c18]/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 z-40 shrink-0 ${
        isCollapsed ? 'w-18' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_18px_rgba(56,189,248,0.4)] shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-xs tracking-wider text-white uppercase font-mono truncate">
                  HYD • MEDCHAL
                </h1>
                <p className="text-[10px] text-cyan-400 font-mono tracking-tight truncate">
                  Cyber SCADA Digital Twin
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all text-left group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(56,189,248,0.15)] font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent font-medium'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400'
                  }`} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap tracking-wide">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono shrink-0 ${
                    item.alert 
                      ? 'bg-red-950/80 text-red-400 border border-red-500/50 animate-pulse font-bold' 
                      : isActive 
                        ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 font-semibold' 
                        : 'bg-slate-800/80 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      {!isCollapsed && (
        <div className="p-3.5 m-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 font-mono text-[10px] space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span>CORE STATUS:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SECURE
            </span>
          </div>
          <div className="text-cyan-400 text-[9px] truncate flex items-center gap-1">
            <span>●</span>
            <span>NVIDIA RTX 3050 CUDA Active</span>
          </div>
          <div className="text-slate-500 text-[9px] truncate">
            PyTorch 2.6.0+cu124 • EVM :8545
          </div>
        </div>
      )}
    </aside>
  );
}
