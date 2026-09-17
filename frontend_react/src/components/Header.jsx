import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck,
  ShieldAlert, 
  Layers, 
  MapPin, 
  Radio
} from 'lucide-react';

export default function Header({ 
  viewMode, 
  setViewMode, 
  isGatewayOnline, 
  threatActive,
  quarantinedCount = 0,
  isStreaming = false
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#070c18]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-30 shadow-md">
      
      {/* Left: Project Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.3)] shrink-0">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            Smart City Cyber Defense
            <span className="text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium">
              Hyderabad & Medchal
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time IoT SCADA Monitoring • AI Protection • Blockchain Audit
          </p>
        </div>
      </div>

      {/* Center: System Status Pill */}
      <div className="hidden lg:flex items-center">
        {!isGatewayOnline ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Gateway Offline • Start python backend/server.py</span>
          </div>
        ) : threatActive ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-xs font-semibold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>ATTACK DETECTED: {quarantinedCount} Node{quarantinedCount > 1 ? 's' : ''} Automatically Isolated</span>
          </div>
        ) : isStreaming ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Live Node-RED Telemetry Streaming • All Locations Protected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>System Standby • Awaiting Node-RED Simulation Packets</span>
          </div>
        )}
      </div>

      {/* Right: Map/3D Switcher & Server Status */}
      <div className="flex items-center gap-3">
        {/* View Switcher Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === '2d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map View</span>
          </button>
          
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D City</span>
          </button>
        </div>

        {/* Live Clock & Connection Pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/70 px-3 py-1.5 rounded-xl border border-slate-800/80 text-xs text-slate-400 font-mono">
          <span className={`w-2 h-2 rounded-full ${isGatewayOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-[11px]">{timeStr}</span>
        </div>
      </div>

    </header>
  );
}
