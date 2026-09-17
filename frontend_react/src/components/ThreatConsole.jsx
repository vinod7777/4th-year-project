import React from 'react';
import { 
  Zap, 
  Radar, 
  Flame, 
  RotateCcw, 
  Terminal, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function ThreatConsole({ onInjectThreat, onReinstateAll, firewallRules }) {
  return (
    <div className="bg-cyber-card rounded-xl border border-slate-800/90 p-3 shadow-xl backdrop-blur-sm space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Threat & Firewall Console
          </h3>
        </div>
        <span className="text-[10px] text-amber-400 font-bold">
          OS-Level Defense
        </span>
      </div>

      {/* Action Buttons Grid */}
      <div className="space-y-2">
        {/* DDoS Button */}
        <button
          onClick={() => onInjectThreat(1, 'medchal-substation-01')}
          className="w-full group p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-500/40 text-red-300 transition-all text-left flex items-center justify-between shadow-md hover:shadow-red-500/20"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">Volumetric DDoS Attack</div>
              <div className="text-[9px] text-red-400/80">Industrial Substation (&gt;900 pkt/s, SYN=1)</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-red-400/60 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* PortScan Button */}
        <button
          onClick={() => onInjectThreat(2, 'medchal-checkpost-02')}
          className="w-full group p-2 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 transition-all text-left flex items-center justify-between shadow-md hover:shadow-amber-500/20"
        >
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">Recon PortScan Probing</div>
              <div className="text-[9px] text-amber-400/80">Medchal Checkpost (Microsecond IAT, RST)</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-amber-400/60 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* HITEC City Strike */}
        <button
          onClick={() => onInjectThreat(1, 'hyd-cyber-06')}
          className="w-full group p-2 rounded-lg bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/40 text-purple-300 transition-all text-left flex items-center justify-between shadow-md hover:shadow-purple-500/20"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-xs">HITEC Cyber Towers Strike</div>
              <div className="text-[9px] text-purple-400/80">Fiber Backbone High-Density SCADA</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-purple-400/60 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Reinstate All Button */}
        <button
          onClick={onReinstateAll}
          className="w-full group p-2 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 transition-all text-left flex items-center justify-between shadow-md hover:shadow-emerald-500/20"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0 group-hover:-rotate-180 transition-transform duration-500" />
            <div>
              <div className="font-bold text-xs">Reinstate All Remediated Nodes</div>
              <div className="text-[9px] text-emerald-400/80">Lift OS Firewall Rules & Restore Active</div>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* OS Firewall Drop Terminal Feed */}
      <div className="space-y-1 pt-1.5 border-t border-slate-800">
        <div className="text-slate-400 text-[9px] flex items-center justify-between">
          <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-cyan-400" /> FIREWALL LOGS (netsh / iptables):</span>
          <span className="text-emerald-400">ACTIVE</span>
        </div>

        <div className="p-2 rounded-lg bg-black/70 border border-slate-800/90 text-[9px] space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
          {firewallRules.length === 0 ? (
            <div className="text-slate-500 italic">No firewall drop rules currently active. All nodes communicating normally.</div>
          ) : (
            firewallRules.map((rule, idx) => (
              <div key={idx} className="space-y-0.5 border-b border-slate-800 pb-1">
                <div className="flex items-center justify-between text-red-400 font-bold">
                  <span>[DROP] Node: {rule.nodeId}</span>
                  <span className="text-slate-500 text-[8px]">{rule.time}</span>
                </div>
                <div className="text-slate-400 truncate">Win: <code className="text-cyan-300">{rule.winCmd}</code></div>
                <div className="text-slate-400 truncate">Linux: <code className="text-purple-300">{rule.linuxCmd}</code></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
