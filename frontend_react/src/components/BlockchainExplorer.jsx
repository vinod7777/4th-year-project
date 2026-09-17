import React from 'react';
import { Blocks, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Key } from 'lucide-react';

export default function BlockchainExplorer({ 
  incidents, 
  blockHeight, 
  gasSpent,
  contractAddress = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab",
  authority = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
}) {
  const shortContract = contractAddress ? `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}` : '0xe78A...a8Ab';
  const shortAuthority = authority ? `${authority.slice(0, 8)}...${authority.slice(-6)}` : '0x90F8...8c9C1';

  return (
    <div className="bg-cyber-card rounded-xl border border-slate-800/90 p-3 shadow-xl backdrop-blur-sm space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Blocks className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            EVM Security Ledger
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">
          Block #{blockHeight}
        </span>
      </div>

      {/* Contract & Gas Metadata Banner */}
      <div className="p-2.5 rounded-lg bg-[#070c18] border border-slate-800/90 space-y-1.5 text-[10px]">
        <div className="flex items-center justify-between text-slate-400">
          <span>CONTRACT:</span>
          <span className="text-cyan-300 font-bold" title={contractAddress}>
            {shortContract}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>AUTHORITY:</span>
          <span className="text-slate-300" title={authority}>{shortAuthority}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>GAS SPENT:</span>
          <span className="text-amber-400 font-bold">{gasSpent.toFixed(6)} ETH</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>CONSENSUS:</span>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> Paris EVM
          </span>
        </div>
      </div>

      {/* Verifiable Incident Receipts List */}
      <div className="space-y-1.5">
        <div className="text-slate-400 text-[9px] flex items-center justify-between">
          <span>ON-CHAIN INCIDENT LOGS:</span>
          <span className="text-cyan-400">{incidents.length} Records</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {incidents.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800/60 text-center text-slate-500 text-xs">
              No on-chain incidents logged yet.
            </div>
          ) : (
            incidents.map((inc, i) => {
              const categoryLabel = inc.attack_category === 1 ? 'DDoS / Flood' : (inc.attack_category === 2 ? 'PortScan' : 'Cyber Threat');
              const txHash = inc.tx_hash || '0x3c2d0cae2b5aeedfa45260328a2df39c27a9f40c3c90286c3691a504f3e00fe8';
              const timeStr = inc.timestamp ? new Date(inc.timestamp * 1000).toLocaleTimeString() : 'Recent';

              return (
                <div key={i} className="p-2 rounded-lg bg-slate-900/80 border border-red-500/40 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-red-400 font-bold text-[10px]">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {categoryLabel}
                    </span>
                    <span className="text-slate-500 text-[9px]">{timeStr}</span>
                  </div>

                  <div className="text-slate-300 text-[10px] truncate">
                    Node: <span className="text-cyan-400 font-bold">{inc.device_id}</span>
                  </div>

                  <div className="text-slate-400 text-[9px] truncate">
                    Zone: {inc.zone}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[9px]">
                    <span className="text-purple-300 font-bold">
                      Confidence: {(inc.confidence_pct || 100).toFixed(1)}%
                    </span>
                    <span className="text-slate-500 truncate max-w-[130px]" title={txHash}>
                      Tx: {txHash.substring(0, 10)}...
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Forensic Proof Card */}
      <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-[9px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-bold">
          <span className="flex items-center gap-1"><Key className="w-3 h-3 text-purple-400" /> FORENSIC HASH:</span>
          <span className="text-emerald-400">SHA-256</span>
        </div>
        <div className="text-slate-500 truncate font-mono">
          Fingerprint: 0x5b3f718a28e9c4d8...3c0e12
        </div>
      </div>
    </div>
  );
}
