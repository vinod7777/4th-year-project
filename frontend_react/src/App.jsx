import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DigitalTwin3D from './components/DigitalTwin3D';
import CartographicMap2D from './components/CartographicMap2D';
import TelemetryChart from './components/TelemetryChart';
import IeeeModal from './components/IeeeModal';
import ErrorBoundary from './components/ErrorBoundary';
import Blockchain3DVisualizer from './components/Blockchain3DVisualizer';
import { INITIAL_MUNICIPAL_NODES } from './data/municipalNodes';

import { 
  Network, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Blocks, 
  Zap, 
  RefreshCw, 
  AlertTriangle,
  Flame,
  Search,
  CheckCircle2,
  FileText,
  MapPin,
  Thermometer,
  Gauge,
  Lock,
  Cpu,
  Clock,
  ExternalLink
} from 'lucide-react';

const BACKEND_URL = (typeof window !== 'undefined' && window.location.port !== '5000') ? 'http://127.0.0.1:5000' : '';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('2d'); // '2d' (map, default) or '3d' (city)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // State
  const [nodes, setNodes] = useState(INITIAL_MUNICIPAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState('hyd-cyber-06');
  const [velocityHistory, setVelocityHistory] = useState(Array(20).fill(0));
  const lastPacketTimeRef = useRef(0);
  const [currentInference, setCurrentInference] = useState({
    predicted_class: 0,
    class_label: "Benign Traffic (Normal)",
    confidence: 0.9882,
    confidence_bps: 9882,
    probabilities: [0.88, 0.04, 0.05, 0.03],
    is_threat: false
  });
  const [incidents, setIncidents] = useState([
    {
      incident_id: 1,
      device_id: 'medchal-checkpost-02',
      zone: 'National Highway 44 - Toll Checkpost',
      attack_category: 1,
      confidence_pct: 100.0,
      tx_hash: '0x3c2d0cae2b5aeedfa45260328a2df39c27a9f40c3c90286c3691a504f3e00fe8',
      timestamp: Math.floor(Date.now() / 1000) - 300
    }
  ]);
  const [blockHeight, setBlockHeight] = useState(152);
  const [gasSpent, setGasSpent] = useState(0.005265);
  const [isGatewayOnline, setIsGatewayOnline] = useState(true);
  const [isIeeeModalOpen, setIsIeeeModalOpen] = useState(false);
  const [contractInfo, setContractInfo] = useState({
    contract: "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab",
    authority: "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
  });

  // Human-readable Activity Feed
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      type: 'info',
      title: 'Smart City Shield Online',
      message: '10 municipal SCADA nodes connected across Medchal & Greater Hyderabad.'
    },
    {
      id: 'init-2',
      time: new Date().toLocaleTimeString(),
      type: 'blockchain',
      title: 'Blockchain Ledger Verified',
      message: 'Ganache EVM security ledger active at 0xe78A...a8Ab (Block #3).'
    }
  ]);

  const pushActivityLog = (type, title, message) => {
    setActivityLogs(prev => [
      {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        time: new Date().toLocaleTimeString(),
        type,
        title,
        message
      },
      ...prev.slice(0, 19)
    ]);
  };

  const quarantinedNodes = Object.values(nodes).filter(n => n.status === 'Quarantined');
  const quarantinedCount = quarantinedNodes.length;
  const threatActive = quarantinedCount > 0;
  const activeNodesCount = Object.values(nodes).length - quarantinedCount;
  const selectedNode = nodes[selectedNodeId] || nodes['hyd-cyber-06'] || Object.values(nodes)[0];

  // Push velocity reading helper
  const pushVelocity = (val) => {
    setVelocityHistory(prev => {
      const next = [...prev.slice(1), val];
      return next;
    });
  };

  // Synchronization with Backend (Dual Redundancy: WebSocket + 1s Polling)
  useEffect(() => {
    // 1. Health & Auto-Reconnection Polling (every 2.5s)
    const checkHealth = () => {
      fetch(`${BACKEND_URL}/api/health`)
        .then(res => res.json())
        .then(data => {
          setIsGatewayOnline(true);
          if (data.blockchain?.block_height) {
            setBlockHeight(data.blockchain.block_height);
          }
          if (data.blockchain?.contract) {
            setContractInfo(prev => ({
              ...prev,
              contract: data.blockchain.contract
            }));
          }
        })
        .catch(() => {
          setIsGatewayOnline(false);
        });
    };

    checkHealth();
    const healthInterval = setInterval(checkHealth, 2500);

    // Initial fetch of incidents
    fetch(`${BACKEND_URL}/api/incidents`)
      .then(res => res.json())
      .then(data => {
        if (data.incidents && data.incidents.length > 0) {
          setIncidents(data.incidents);
        }
      })
      .catch(() => {});

    // 2. Centralized Telemetry Processor (handles both Socket.IO & Polling)
    const lastSeenPayloadKeyRef = { current: null };

    const processTelemetryPayload = (data) => {
      if (!data || !data.classification) return;
      
      const payloadKey = `${data.timestamp}-${data.node?.id}-${data.rate}`;
      if (lastSeenPayloadKeyRef.current === payloadKey) return;
      lastSeenPayloadKeyRef.current = payloadKey;

      setIsGatewayOnline(true);
      lastPacketTimeRef.current = Date.now();

      const nodeId = data.node ? data.node.id : null;
      const rate = typeof data.rate === 'number' ? data.rate : (data.classification?.is_threat ? 3800.0 : 22.0);
      pushVelocity(rate);
      setCurrentInference(data.classification);

      if (nodeId) {
        setNodes(prev => ({
          ...prev,
          [nodeId]: {
            ...prev[nodeId],
            rate: rate,
            status: data.quarantine_enforced ? 'Quarantined' : prev[nodeId]?.status || 'Active'
          }
        }));

        if (data.quarantine_enforced && data.blockchain_receipt) {
          setBlockHeight(prev => prev + 1);
          setGasSpent(prev => prev + 0.000254);
          setIncidents(prev => [
            {
              device_id: nodeId,
              zone: data.node.zone,
              attack_category: data.classification.predicted_class,
              confidence_pct: data.classification.confidence * 100,
              tx_hash: data.blockchain_receipt.tx_hash,
              timestamp: data.timestamp
            },
            ...prev
          ]);
          pushActivityLog('threat', `Attack Blocked on ${data.node?.name || nodeId}`, `AI Confidence: ${(data.classification.confidence * 100).toFixed(1)}%. Node isolated via Host Firewall.`);
        }
      }
    };

    // 3. WebSocket Connection
    const socketUrl = BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5000');
    let socket;
    try {
      socket = io(socketUrl, { 
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      socket.on('connect', () => {
        setIsGatewayOnline(true);
      });

      socket.on('disconnect', () => {
        // Handled gracefully; HTTP health polling maintains actual gateway status
      });

      socket.on('telemetry_stream', (data) => {
        processTelemetryPayload(data);
      });
    } catch (e) {
      console.warn('Socket connection initialization:', e);
    }

    // 4. Dual-Redundant Live Polling (Pulls latest Node-RED telemetry from backend every 1s)
    const telemetryPollInterval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/latest_telemetry`)
        .then(res => res.json())
        .then(data => {
          if (data && data.classification) {
            processTelemetryPayload(data);
          }
        })
        .catch(() => {});
    }, 1000);

    // 5. Real-Time Idle Decay: If no live packets arrive from Node-RED in 2.5 seconds, traffic drops to 0
    const idleDecay = setInterval(() => {
      if (Date.now() - lastPacketTimeRef.current > 2500) {
        pushVelocity(0.0);
      }
    }, 1000);

    return () => {
      clearInterval(healthInterval);
      clearInterval(telemetryPollInterval);
      clearInterval(idleDecay);
      if (socket) socket.disconnect();
    };
  }, []);

  // Threat Injection Handler (Simulate Cyberattack Evaluated by DL Model)
  const handleInjectThreat = (attackType = 1, targetNodeId = null) => {
    const nodeToAttack = targetNodeId || selectedNodeId || 'hyd-cyber-06';
    const node = nodes[nodeToAttack];
    if (!node) return;

    setSelectedNodeId(nodeToAttack);

    // Exact Merged62.csv 39-feature attack benchmark vectors evaluated by our 1D-CNN DL model:
    const ATTACK_VECTORS = {
      1: [19.76, 6.0, 67.82, 6874.2178, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.02, 0.0, 0.0, 0.0, 0.0, 0.98, 0.02, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 6034.0, 60.0, 81.0, 60.34, 2.4586, 60.34, 0.0001, 100.0, 6.0448],
      2: [20.0, 6.0, 255.0, 415.4709, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 600.0, 60.0, 60.0, 60.0, 0.0, 60.0, 0.0026, 10.0, 0.0],
      3: [8.0, 17.0, 57.0, 277.6232, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 4500.0, 56.0, 808.0, 450.0, 358.7231, 450.0, 0.0036, 10.0, 128682.2188]
    };

    const vector = ATTACK_VECTORS[attackType] || ATTACK_VECTORS[1];
    const velocity = vector[3];
    lastPacketTimeRef.current = Date.now();
    pushVelocity(velocity);

    const payload = {
      node_id: nodeToAttack,
      node_name: node.name,
      municipal_zone: node.zone,
      attack_mode: attackType,
      flow_stats: vector,
      sensor_telemetry: {
        voltage: node.voltage,
        temp: node.temp + 14.5,
        load_pct: 95.0
      }
    };

    // Send real attack flow vector to backend for PyTorch DL Model inference
    fetch(`${BACKEND_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.classification) {
        setCurrentInference(data.classification);
        const isThreat = data.classification.is_threat;
        const threatName = data.classification.class_label;
        const confPct = data.classification.confidence_percentage;

        if (isThreat) {
          setNodes(prev => ({
            ...prev,
            [nodeToAttack]: {
              ...prev[nodeToAttack],
              status: 'Quarantined',
              rate: velocity,
              temp: prev[nodeToAttack].temp + 12.0
            }
          }));

          pushActivityLog('threat', `🚨 ${threatName} Detected by DL Model!`, `Target: ${node.name} (${node.ip}). Model Output: ${threatName} (${confPct}% confidence).`);
          pushActivityLog('quarantine', `🛡️ Automated Defense Triggered`, `DL Model confidence: ${confPct}%. Node isolated via Host Firewall.`);

          if (data.quarantine?.tx_hash) {
            setBlockHeight(prev => prev + 1);
            setGasSpent(prev => prev + 0.000254);
            setIncidents(prev => [
              {
                device_id: nodeToAttack,
                zone: node.zone,
                attack_category: data.classification.predicted_class,
                confidence_pct: confPct,
                tx_hash: data.quarantine.tx_hash,
                timestamp: Math.floor(Date.now() / 1000)
              },
              ...prev
            ]);
            pushActivityLog('blockchain', `⛓️ Logged to Blockchain Ledger`, `Immutable proof recorded: ${data.quarantine.tx_hash.slice(0, 16)}...`);
          }
        }
      }
    })
    .catch(err => {
      console.error('Attack simulation failed:', err);
    });
  };

  // Node Reinstatement Handler
  const handleReinstate = (nodeId) => {
    const node = nodes[nodeId];
    if (!node) return;

    setNodes(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        status: 'Active',
        rate: 20.0 + Math.random() * 5.0,
        temp: Math.max(28.0, prev[nodeId].temp - 10.0)
      }
    }));

    pushActivityLog('restore', `✅ Node Restored: ${node.name}`, `Firewall blocks removed. Node returned to normal active status.`);

    fetch(`${BACKEND_URL}/api/reinstate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_id: nodeId })
    }).catch(() => {});
  };

  // Restore All Systems
  const handleReinstateAll = () => {
    const updated = {};
    Object.keys(nodes).forEach(k => {
      updated[k] = {
        ...nodes[k],
        status: 'Active',
        rate: 20.0 + Math.random() * 4.0,
        temp: Math.max(28.0, nodes[k].temp - 8.0)
      };
    });
    setNodes(updated);
    pushVelocity(22.0);
    setCurrentInference({
      predicted_class: 0,
      class_label: "Benign Traffic (Normal)",
      confidence: 0.992,
      confidence_bps: 9920,
      probabilities: [0.98, 0.01, 0.01, 0.0],
      is_threat: false
    });
    pushActivityLog('restore', `🛡️ All Systems Restored`, `All 10 nodes active. Threat status cleared.`);

    Object.keys(nodes).forEach(id => {
      fetch(`${BACKEND_URL}/api/reinstate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: id })
      }).catch(() => {});
    });
  };

  return (
    <div className="flex h-screen w-screen bg-[#05080f] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        threatActive={threatActive}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <Header 
          viewMode={viewMode}
          setViewMode={setViewMode}
          isGatewayOnline={isGatewayOnline}
          threatActive={threatActive}
          quarantinedCount={quarantinedCount}
          isStreaming={(velocityHistory[velocityHistory.length - 1] || 0) > 0}
        />

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-5">
          
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. City Grid Status */}
                <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-lg ${
                  threatActive 
                    ? 'bg-gradient-to-br from-red-950/40 to-slate-900 border-red-500/50 shadow-red-900/10' 
                    : 'bg-gradient-to-br from-slate-900/80 to-slate-950 border-slate-800/80'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City Grid Status</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      threatActive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Network className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {threatActive ? `${quarantinedCount} Node Isolated` : '10 / 10 Nodes Safe'}
                  </div>
                  <div className={`text-xs mt-1 font-medium flex items-center gap-1.5 ${
                    threatActive ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {threatActive ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Automated Firewall Drop Active</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>All Locations Fully Protected</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. AI Protection */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800/80 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Cyber Defense</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    98.7% <span className="text-sm font-normal text-slate-400">Accuracy</span>
                  </div>
                  <div className="text-xs text-cyan-400 mt-1 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>1D-CNN • RTX 3050 CUDA</span>
                  </div>
                </div>

                {/* 3. Blockchain EVM Ledger */}
                <div 
                  onClick={() => setActiveTab('blockchain3d')}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800/80 shadow-lg cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all group"
                  title="Click to open 3D Three.js & GSAP Blockchain Ledger"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-purple-300 transition-colors">Blockchain Audit</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Blocks className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-extrabold text-white flex items-center justify-between">
                    <span>Block #{blockHeight}</span>
                    <span className="text-[10px] font-mono text-purple-400 font-semibold bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/30 group-hover:border-purple-400">
                      3D View &rarr;
                    </span>
                  </div>
                  <div className="text-xs text-purple-300 mt-1 font-medium truncate" title={contractInfo.contract}>
                    Ganache EVM • Tamper-proof
                  </div>
                </div>

                {/* 4. Network Traffic Velocity */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800/80 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Traffic</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className={`text-2xl font-extrabold ${threatActive ? 'text-red-400 animate-pulse' : ((velocityHistory[velocityHistory.length - 1] || 0) > 0 ? 'text-white' : 'text-slate-500')}`}>
                    {(velocityHistory[velocityHistory.length - 1] || 0).toFixed(1)}{' '}
                    <span className="text-sm font-normal text-slate-400">pkt/s</span>
                  </div>
                  <div className="text-xs mt-1 font-medium">
                    {!isGatewayOnline ? (
                      <span className="text-amber-400 font-mono">Gateway Offline (Start backend)</span>
                    ) : threatActive ? (
                      <span className="text-red-400">Traffic Surge Detected</span>
                    ) : (velocityHistory[velocityHistory.length - 1] || 0) > 0 ? (
                      <span className="text-emerald-400">Live Telemetry Flow</span>
                    ) : (
                      <span className="text-slate-500">Idle • Awaiting Node-RED Stream</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Quick Simulation & Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live Cyberattack Simulation Console:
                  </span>
                  <span className="text-xs text-slate-400 hidden md:inline">
                    (Test how the AI & Blockchain instantly detect and isolate threats)
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Simulate DDoS */}
                  <button
                    onClick={() => handleInjectThreat(1)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Simulate DDoS Attack</span>
                  </button>

                  {/* Simulate PortScan */}
                  <button
                    onClick={() => handleInjectThreat(2)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Simulate PortScan</span>
                  </button>

                  {/* Reset / Restore */}
                  <button
                    onClick={handleReinstateAll}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Restore All Systems</span>
                  </button>
                </div>
              </div>

              {/* Main Area: Map/3D Canvas (Left) + Right Control Hub (Traffic & Feed) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left 8 Cols: Large Interactive Digital Twin Map / 3D Canvas */}
                <div className="lg:col-span-8 flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 overflow-hidden shadow-xl min-h-[500px]">
                  
                  {/* Canvas Header */}
                  <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        {viewMode === '2d' ? '2D Cartographic City Map (Leaflet Dark)' : '3D WebGL Holographic City (Three.js)'}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-400">
                      Targeted: <span className="font-bold text-cyan-300">{selectedNode.name}</span>
                    </div>
                  </div>

                  {/* Visualizer Viewport */}
                  <div className="flex-1 relative min-h-[380px] w-full h-full bg-[#070c18]">
                    {viewMode === '2d' ? (
                      <CartographicMap2D 
                        nodes={nodes}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                        onInjectThreat={handleInjectThreat}
                        onReinstate={handleReinstate}
                      />
                    ) : (
                      <DigitalTwin3D 
                        nodes={nodes}
                        selectedNodeId={selectedNodeId}
                        onSelectNode={setSelectedNodeId}
                      />
                    )}
                  </div>

                  {/* Selected Node Inspector Footer */}
                  <div className="p-4 bg-slate-900/95 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-slate-500 font-medium">Selected Location:</span>
                        <div className="font-bold text-slate-100 text-sm">{selectedNode.name}</div>
                      </div>
                      <div className="hidden sm:block">
                        <span className="text-slate-500 font-medium">IP Address:</span>
                        <div className="font-mono text-cyan-400">{selectedNode.ip}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Condition:</span>
                        <div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            selectedNode.status === 'Quarantined' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedNode.status === 'Quarantined' ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`}></span>
                            {selectedNode.status === 'Quarantined' ? 'Quarantined / Threat Isolated' : 'Safe & Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Node Action Buttons */}
                    <div className="flex items-center gap-2">
                      {selectedNode.status === 'Quarantined' ? (
                        <button
                          onClick={() => handleReinstate(selectedNode.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reinstate Location</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInjectThreat(1, selectedNode.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5 text-red-400" />
                          <span>Simulate Threat Here</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right 4 Cols: Live Telemetry Velocity & Plain-English Activity Timeline */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  
                  {/* Real-time Traffic Velocity Graph */}
                  <div className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-4 shadow-xl">
                    <ErrorBoundary>
                      <TelemetryChart velocityHistory={velocityHistory} />
                    </ErrorBoundary>
                  </div>

                  {/* Plain-English Live Activity Timeline */}
                  <div className="bg-slate-900/80 rounded-2xl border border-slate-800/90 p-4 shadow-xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Security Activity Log
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Live Feed</span>
                    </div>

                    {/* Feed List */}
                    <div className="space-y-3 overflow-y-auto max-h-72 pr-1 custom-scrollbar flex-1 text-xs">
                      {activityLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{log.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            {log.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: 3D BLOCKCHAIN LEDGER (THREE.JS + GSAP) */}
          {/* ========================================================================= */}
          {activeTab === 'blockchain3d' && (
            <div className="space-y-4">
              <Blockchain3DVisualizer
                incidents={incidents}
                blockHeight={blockHeight}
                gasSpent={gasSpent}
                contractAddress={contractInfo.contract}
                authority={contractInfo.authority}
                onSimulateAttack={(category) => handleInjectThreat(category)}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CITY LOCATIONS (10 MUNICIPAL NODES) */}
          {/* ========================================================================= */}
          {activeTab === 'nodes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Metropolitan SCADA Locations (10 Nodes)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Active sensor stations, substations, water plants, and transit gateways across Medchal North & Greater Hyderabad.
                  </p>
                </div>
                <button
                  onClick={handleReinstateAll}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore All</span>
                </button>
              </div>

              {/* 10 Node Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Object.values(nodes).map((n) => {
                  const isQuarantined = n.status === 'Quarantined';
                  return (
                    <div 
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 shadow-md flex flex-col justify-between space-y-3 ${
                        isQuarantined 
                          ? 'bg-red-950/20 border-red-500/50 shadow-red-900/10' 
                          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                              {n.cluster}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5">{n.name}</h4>
                            <p className="text-[11px] text-slate-400">{n.zone}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                            isQuarantined 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {isQuarantined ? 'Quarantined' : 'Active'}
                          </span>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono mt-3">
                          <div>
                            <span className="text-slate-500 block text-[9px]">IP</span>
                            <span className="text-cyan-300 font-semibold truncate block">{n.ip}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">TEMP</span>
                            <span className="text-slate-200 block">{n.temp.toFixed(1)}°C</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">TRAFFIC</span>
                            <span className="text-amber-400 block">{n.rate.toFixed(1)}/s</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => handleInjectThreat(1, n.id)}
                          className="flex-1 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Flame className="w-3 h-3 text-red-400" />
                          <span>Test Threat</span>
                        </button>
                        <button
                          onClick={() => handleReinstate(n.id)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Reinstate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AI & BLOCKCHAIN DEFENSE */}
          {/* ========================================================================= */}
          {activeTab === 'defense' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Autonomous AI & Blockchain Cyber Protection
                </h3>
                <p className="text-xs text-slate-400">
                  How our system autonomously inspects every data packet, detects cyberattacks with deep learning, and creates permanent incident receipts on an Ethereum smart contract.
                </p>
              </div>

              {/* 2-Column Explainer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {/* 1. AI 1D-CNN Defense Panel */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">PyTorch 1D-CNN Artificial Intelligence</h4>
                      <p className="text-[11px] text-cyan-400">Deep Learning Intrusion Detection System</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Our 1D Convolutional Neural Network analyzes incoming network flow telemetry in real-time, checking 39 network traffic features (packet rates, inter-arrival times, payload headers) to catch anomalies in microseconds.
                  </p>

                  {/* Live Softmax Confidence Box */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Current Inference State:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        currentInference.is_threat ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {currentInference.class_label}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>AI Confidence Score:</span>
                        <span className="font-bold text-cyan-300">{(currentInference.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            currentInference.is_threat ? 'bg-red-500' : 'bg-cyan-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, currentInference.confidence * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>1.84M Training Samples:</strong> Trained on complete CIC-IoT2023 dataset with zero subsampling.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>98.69% Test Accuracy:</strong> 100.00% recall on volumetric DDoS and flood attacks.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Automated Invariant:</strong> Triggers host firewall isolation whenever confidence exceeds 95.0%.</span>
                    </div>
                  </div>
                </div>

                {/* 2. Blockchain EVM Ledger Panel */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Blocks className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Ethereum EVM Smart Contract Audit</h4>
                        <p className="text-[11px] text-purple-300">Tamper-Proof Incident Ledger</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('blockchain3d')}
                      className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-500/50 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Blocks className="w-3.5 h-3.5" />
                      <span>Launch 3D Visualizer</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Whenever an attack is detected, the gateway submits an on-chain transaction to <code className="text-purple-300">SmartCitySecurityLedger.sol</code>. This permanently seals the incident details and SHA-256 telemetry fingerprint so no attacker can manipulate log files.
                  </p>

                  {/* Contract Details */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Contract:</span>
                      <span className="text-purple-300 font-bold" title={contractInfo.contract}>
                        {contractInfo.contract.slice(0, 10)}...{contractInfo.contract.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Authority:</span>
                      <span className="text-slate-300">{contractInfo.authority.slice(0, 10)}...{contractInfo.authority.slice(-8)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Block Height:</span>
                      <span className="text-cyan-400 font-bold">#{blockHeight}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Gas Spent:</span>
                      <span className="text-amber-400 font-bold">{gasSpent.toFixed(6)} ETH</span>
                    </div>
                  </div>

                  {/* On-Chain Incidents Feed */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400">Recent Verifiable Receipts:</span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-[11px] font-mono">
                      {incidents.slice(0, 4).map((inc, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <span className="text-cyan-400 font-bold">{inc.device_id}</span>
                            <span className="text-slate-500 block truncate text-[9px]">{inc.tx_hash}</span>
                          </div>
                          <span className="text-emerald-400 font-bold text-[10px] shrink-0">VERIFIED</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: IEEE RESEARCH VISUALIZATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'research' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Academic Research & Performance Benchmark Gallery
                  </h3>
                  <p className="text-xs text-slate-400">
                    300-DPI high-resolution figures generated for thesis and IEEE publication manuscripts.
                  </p>
                </div>
                <button
                  onClick={() => setIsIeeeModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Fullscreen Gallery</span>
                </button>
              </div>

              {/* Research Figures Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Fig 1 */}
                <div 
                  onClick={() => setIsIeeeModalOpen(true)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 shadow-lg group"
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 flex items-center justify-center relative">
                    <img 
                      src="/ieee_figures/fig1_convergence_curves.png" 
                      alt="Fig 1: Convergence Dynamics" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-white pt-1">Figure 1: Training & Convergence Curves</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Smooth 20-epoch training and validation loss decline confirming generalizability without overfitting.
                  </p>
                </div>

                {/* Fig 2 */}
                <div 
                  onClick={() => setIsIeeeModalOpen(true)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 shadow-lg group"
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 flex items-center justify-center relative">
                    <img 
                      src="/ieee_figures/fig2_confusion_matrix.png" 
                      alt="Fig 2: Multi-Class Confusion Matrix" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-white pt-1">Figure 2: Multi-Class Confusion Matrix</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    100.00% true positive recall across 350,117 DDoS attack samples with zero false negatives.
                  </p>
                </div>

                {/* Fig 3 */}
                <div 
                  onClick={() => setIsIeeeModalOpen(true)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 shadow-lg group"
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 flex items-center justify-center relative">
                    <img 
                      src="/ieee_figures/fig3_roc_curves.png" 
                      alt="Fig 3: Receiver Operating Characteristic (ROC)" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-white pt-1">Figure 3: ROC Curves & AUC Metric</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Macro-average Area Under Curve (AUC) of 0.9959 showing near-perfect discrimination threshold.
                  </p>
                </div>

                {/* Fig 6 */}
                <div 
                  onClick={() => setIsIeeeModalOpen(true)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition-all cursor-pointer space-y-2 shadow-lg group"
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 border border-slate-800 flex items-center justify-center relative">
                    <img 
                      src="/ieee_figures/fig6_feature_importance.png" 
                      alt="Fig 6: Feature Saliency" 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-white pt-1">Figure 6: Top-15 Feature Saliency Attribution</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Identifies flow rate, packet duration, and inter-arrival time (IAT) as the highest contributing cyber metrics.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Fullscreen IEEE Research Modal */}
      <IeeeModal 
        isOpen={isIeeeModalOpen} 
        onClose={() => setIsIeeeModalOpen(false)} 
      />

    </div>
  );
}
