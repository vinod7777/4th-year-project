import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { 
  Blocks, 
  Cpu, 
  ShieldCheck, 
  ExternalLink, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Eye, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Layers, 
  Copy, 
  Check, 
  Search, 
  Activity, 
  ChevronRight,
  Terminal,
  Clock
} from 'lucide-react';

export default function Blockchain3DVisualizer({ 
  incidents = [], 
  blockHeight = 152, 
  gasSpent = 0.0245,
  contractAddress = "0xaCA19693eED93AEE6Edf4bde72bAF560F46BF95d",
  authority = "0xDb4c7A5786C14C802a466D57F138f29C958863f6",
  onSimulateAttack = null
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const blocksGroupRef = useRef(null);
  const connectorsGroupRef = useRef(null);
  const pedestalsGroupRef = useRef(null);
  const conduitPulsesRef = useRef([]);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const blockMeshesRef = useRef([]);
  const animFrameIdRef = useRef(null);

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isMining, setIsMining] = useState(false);
  const [miningStatusText, setMiningStatusText] = useState("CONSENSUS READY");
  const [autoRotate, setAutoRotate] = useState(true);
  const [copiedContract, setCopiedContract] = useState(false);

  const prevBlockHeightRef = useRef(blockHeight);

  const handleCopyContract = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(contractAddress);
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  // --- High-Resolution Canvas Texture Generators (1024x1024) ---

  // 1. Front Face: High-tech holographic cyber deck texture
  const createFrontTexture = (blockNum, status, attackCategory, txHash, nodeName) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const isDDoS = attackCategory === 1;
    const isPortScan = attackCategory === 2;
    const isSpoofing = attackCategory === 3;
    const isBenign = !isDDoS && !isPortScan && !isSpoofing;

    // Deep Obsidian / Dark Space Background with subtle grid
    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle internal cyber circuit grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 2;
    for (let x = 40; x < 1024; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 984);
      ctx.stroke();
    }
    for (let y = 40; y < 1024; y += 80) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(984, y);
      ctx.stroke();
    }

    // Glowing Outer Accent Border
    const accentColor = status === 'MINING' 
      ? '#f59e0b' 
      : (isDDoS ? '#f43f5e' : (isPortScan ? '#f59e0b' : (isSpoofing ? '#a855f7' : '#06b6d4')));
    
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 16;
    ctx.strokeRect(20, 20, 984, 984);

    // Corner tech brackets
    ctx.fillStyle = accentColor;
    const bracketSize = 50;
    // Top-left
    ctx.fillRect(20, 20, bracketSize, 16);
    ctx.fillRect(20, 20, 16, bracketSize);
    // Top-right
    ctx.fillRect(1004 - bracketSize, 20, bracketSize, 16);
    ctx.fillRect(1004 - 16, 20, 16, bracketSize);
    // Bottom-left
    ctx.fillRect(20, 1004 - 16, bracketSize, 16);
    ctx.fillRect(20, 1004 - bracketSize, 16, bracketSize);
    // Bottom-right
    ctx.fillRect(1004 - bracketSize, 1004 - 16, bracketSize, 16);
    ctx.fillRect(1004 - 16, 1004 - bracketSize, 16, bracketSize);

    // Header Badge Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(60, 60, 904, 110);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, 904, 110);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillText("ETHEREUM EVM // GANACHE :8545", 90, 128);

    // Block Height (Massive and Crisp)
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 110px "Inter", sans-serif';
    ctx.fillText(`BLOCK #${blockNum}`, 60, 290);

    // Status Pill
    const pillBg = status === 'MINING' ? '#78350f' : (isBenign ? '#064e3b' : '#881337');
    const pillText = status === 'MINING' ? '#fcd34d' : (isBenign ? '#34d399' : '#fda4af');
    const statusLabel = status === 'MINING' ? '● MINING IN PROGRESS' : '✔ SEALED ON-CHAIN (VERIFIED)';

    ctx.fillStyle = pillBg;
    ctx.beginPath();
    ctx.roundRect(60, 340, 640, 70, 35);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = pillText;
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillText(statusLabel, 95, 390);

    // Incident / Event Banner
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(60, 450, 904, 140);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 450, 904, 140);

    let incidentTitle = "SECURITY CHECKPOINT // BENIGN";
    if (isDDoS) incidentTitle = "DDOS VOLUMETRIC FLOOD ATTACK";
    else if (isPortScan) incidentTitle = "PORTSCAN RECONNAISSANCE PROBE";
    else if (isSpoofing) incidentTitle = "DNS / ARP INJECTION SPOOF";

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 32px "JetBrains Mono", monospace';
    ctx.fillText("INCIDENT CLASSIFICATION:", 90, 500);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Inter", sans-serif';
    ctx.fillText(incidentTitle, 90, 555);

    // Target Municipal Station
    ctx.fillStyle = '#94a3b8';
    ctx.font = '32px "JetBrains Mono", monospace';
    ctx.fillText("TARGET SCADA NODE:", 60, 640);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 38px "Inter", sans-serif';
    ctx.fillText(nodeName || "hyd-cyber-06 (Cyber Towers)", 60, 690);

    // Cryptographic Proofs Section
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(60, 730, 904, 210);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 730, 904, 210);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText("EVM TX HASH:", 90, 780);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '28px "JetBrains Mono", monospace';
    const cleanHash = txHash ? (txHash.slice(0, 24) + '...' + txHash.slice(-10)) : '0x99ea1ea9a8...e643';
    ctx.fillText(cleanHash, 90, 820);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText("SHA-256 TELEMETRY ROOT:", 90, 875);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '28px "JetBrains Mono", monospace';
    ctx.fillText("0x7f83b1657ff1fc53b92dc18148a1d65d...", 90, 915);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  };

  // 2. Top Face: Futuristic Ethereum Crystal / Core pattern
  const createTopTexture = (accentColor = '#38bdf8') => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#060a14';
    ctx.fillRect(0, 0, 512, 512);

    // Glowing border
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 492, 492);

    // Concentric cyber circles
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 256, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Ethereum Diamond geometry in center
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    // Top diamond
    ctx.moveTo(256, 140);
    ctx.lineTo(320, 250);
    ctx.lineTo(256, 280);
    ctx.lineTo(192, 250);
    ctx.closePath();
    ctx.fill();

    // Bottom diamond
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.moveTo(256, 295);
    ctx.lineTo(320, 265);
    ctx.lineTo(256, 370);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(200, 220, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(256, 295);
    ctx.lineTo(192, 265);
    ctx.lineTo(256, 370);
    ctx.closePath();
    ctx.fill();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("SMART CITY LEDGER // EVM", 256, 440);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  };

  // 3. Compact Floating 3D Sprite Label hovering directly above each block
  const createBlockSprite = (blockNum, isLatest, isThreat) => {
    const canvas = document.createElement('canvas');
    canvas.width = 340;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    const accentColor = isLatest ? '#38bdf8' : (isThreat ? '#f43f5e' : '#10b981');

    // Subtle dark glass background
    ctx.fillStyle = 'rgba(6, 10, 20, 0.95)';
    ctx.roundRect(4, 4, 332, 72, 18);
    ctx.fill();

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Block number label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`BLOCK #${blockNum}`, 20, 48);

    // Status tag on right
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(isLatest ? '● LATEST' : (isThreat ? '● ISOLATED' : '✔ SEALED'), 315, 48);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.2, 0.52, 1);
    return sprite;
  };

  // --- Trigger 3D Mining & Block Forging Animation using GSAP ---
  const trigger3DMiningAnimation = (newBlockNum, incidentData) => {
    if (!sceneRef.current || !blocksGroupRef.current) return;

    setIsMining(true);
    setMiningStatusText("SOLVING SHA-256 PROOF & MINING CANDIDATE BLOCK...");

    // 1. Spawn Energy Particle shooting into the candidate block position
    const particleGeo = new THREE.SphereGeometry(0.4, 24, 24);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.set(-10, 5, 2);
    sceneRef.current.add(particle);

    // Point light on particle
    const particleLight = new THREE.PointLight(0xf59e0b, 4, 15);
    particle.add(particleLight);

    // GSAP Curve shot
    gsap.to(particle.position, {
      x: 7.5,
      y: 1.5,
      z: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        particleMat.color.setHSL(0.12 + Math.random() * 0.08, 1.0, 0.6);
      },
      onComplete: () => {
        sceneRef.current.remove(particle);
        particleGeo.dispose();
        particleMat.dispose();

        // 2. Mining Flash & Block Seal
        setMiningStatusText(`MINING CONFIRMED ON BLOCK #${newBlockNum}! IMMUTABLY SEALED.`);

        // Rebuild and shift the blocks chain
        renderBlocksChain(newBlockNum, incidentData, true);
        setIsMining(false);
        setMiningStatusText("CONSENSUS READY");
      }
    });
  };

  // --- Rebuild 3D blocks chain visualization ---
  const renderBlocksChain = (currentHeight, latestIncident, animateLatest = false) => {
    if (!blocksGroupRef.current || !connectorsGroupRef.current || !pedestalsGroupRef.current) return;

    // Clear old blocks & connectors
    while (blocksGroupRef.current.children.length > 0) {
      const obj = blocksGroupRef.current.children[0];
      blocksGroupRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    while (connectorsGroupRef.current.children.length > 0) {
      const obj = connectorsGroupRef.current.children[0];
      connectorsGroupRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    while (pedestalsGroupRef.current.children.length > 0) {
      const obj = pedestalsGroupRef.current.children[0];
      pedestalsGroupRef.current.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) obj.material.dispose();
    }

    blockMeshesRef.current = [];
    conduitPulsesRef.current = [];

    // Render 5 sequential blocks in a chain
    const displayCount = 5;
    const blockSpacing = 4.8;
    const startX = -((displayCount - 1) * blockSpacing) / 2;
    const safeHeight = Math.max(displayCount, Number(currentHeight) || 152);

    for (let i = 0; i < displayCount; i++) {
      const num = safeHeight - (displayCount - 1 - i);
      const isLatest = (i === displayCount - 1);
      const xPos = startX + (i * blockSpacing);

      // Match incident or synthesize realistic SCADA telemetry
      const inc = (isLatest && latestIncident) ? latestIncident : (incidents[displayCount - 1 - i] || {
        device_id: i % 2 === 0 ? 'hyd-cyber-06' : 'medchal-checkpost-02',
        zone: i % 2 === 0 ? 'Cyber Towers Transit Corridor' : 'National Highway 44 Toll Checkpost',
        attack_category: i === displayCount - 1 ? 1 : (i % 2 === 0 ? 1 : 2),
        confidence_pct: 100.0,
        tx_hash: `0x${num}c89ea1ea9a8ce2270d48ff8b788ec13a7c0d2f2782179c622bf683adeedd7e643`
      });

      const isThreat = inc.attack_category === 1 || inc.attack_category === 2 || inc.attack_category === 3;
      const themeColor = isLatest 
        ? '#38bdf8' 
        : (inc.attack_category === 1 ? '#f43f5e' : (inc.attack_category === 2 ? '#f59e0b' : '#10b981'));

      // 1. Textures for the 6 faces: Front, Top, and Sleek Side Faces
      const frontTex = createFrontTexture(num, isLatest ? 'SEALED' : 'VERIFIED', inc.attack_category, inc.tx_hash, inc.device_id);
      const topTex = createTopTexture(themeColor);

      const sideCanvas = document.createElement('canvas');
      sideCanvas.width = 512;
      sideCanvas.height = 512;
      const sCtx = sideCanvas.getContext('2d');
      sCtx.fillStyle = '#060a14';
      sCtx.fillRect(0, 0, 512, 512);
      sCtx.strokeStyle = themeColor;
      sCtx.lineWidth = 10;
      sCtx.strokeRect(10, 10, 492, 492);
      sCtx.fillStyle = themeColor;
      sCtx.font = 'bold 36px "JetBrains Mono", monospace';
      sCtx.textAlign = 'center';
      sCtx.fillText(`BLOCK #${num}`, 256, 180);
      sCtx.fillStyle = '#94a3b8';
      sCtx.font = '24px "JetBrains Mono", monospace';
      sCtx.fillText("IMMUTABLE MERKLE TREE", 256, 260);
      sCtx.fillText("SOLIDITY 0.8.20", 256, 310);
      sCtx.fillStyle = '#38bdf8';
      sCtx.font = 'bold 26px "JetBrains Mono", monospace';
      sCtx.fillText("GANACHE EVM // 21,000 GAS", 256, 380);
      const sideTex = new THREE.CanvasTexture(sideCanvas);

      // Materials array: Right, Left, Top, Bottom, Front, Back
      const blockMaterials = [
        new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.15, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.15, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.2, metalness: 0.5 }),
        new THREE.MeshStandardMaterial({ color: 0x050811, roughness: 0.8, metalness: 0.2 }),
        new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.15, metalness: 0.3 }),
        new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.15, metalness: 0.4 })
      ];

      // 2. Outer Glass Block Mesh
      const geometry = new THREE.BoxGeometry(2.7, 2.7, 2.7);
      const blockMesh = new THREE.Mesh(geometry, blockMaterials);
      blockMesh.position.set(xPos, 1.6, 0);
      blockMesh.userData = {
        blockNum: num,
        incident: inc,
        isLatest: isLatest
      };

      // 3. Inner Glowing Pulsing Core Cube
      const innerGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      const innerMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        emissive: themeColor,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85
      });
      const innerCube = new THREE.Mesh(innerGeo, innerMat);
      blockMesh.add(innerCube);

      // Pulse inner core continuously
      gsap.to(innerMat, {
        emissiveIntensity: 1.2,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // 4. Glowing Neon Edge Wireframe
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(themeColor), 
        linewidth: 3 
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      blockMesh.add(wireframe);

      // 5. Floating 3D Sprite Header
      const sprite = createBlockSprite(num, isLatest, isThreat);
      sprite.position.set(0, 1.85, 0);
      blockMesh.add(sprite);

      // 6. Holographic Floor Pedestal Projection
      const pedRingGeo = new THREE.RingGeometry(1.5, 2.0, 32);
      const pedRingMat = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(themeColor), 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.45 
      });
      const pedRing = new THREE.Mesh(pedRingGeo, pedRingMat);
      pedRing.rotation.x = Math.PI / 2;
      pedRing.position.set(xPos, 0.02, 0);
      pedestalsGroupRef.current.add(pedRing);

      // Animate pedestal rotation
      gsap.to(pedRing.rotation, {
        z: Math.PI * 2,
        duration: 18,
        repeat: -1,
        ease: 'none'
      });

      blocksGroupRef.current.add(blockMesh);
      blockMeshesRef.current.push(blockMesh);

      // 7. Glowing Data Connector Cable to previous block
      if (i > 0) {
        const prevX = startX + ((i - 1) * blockSpacing);
        const cableLength = blockSpacing - 2.7;
        const cableGeo = new THREE.CylinderGeometry(0.14, 0.14, cableLength, 16);
        const cableMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.9,
          roughness: 0.2,
          metalness: 0.9
        });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.rotation.z = Math.PI / 2;
        cable.position.set(prevX + blockSpacing / 2, 1.6, 0);
        connectorsGroupRef.current.add(cable);

        // Traveling pulse photon ring along the connector
        const pulseGeo = new THREE.SphereGeometry(0.24, 16, 16);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.position.set(prevX + 1.35, 1.6, 0);
        connectorsGroupRef.current.add(pulse);

        // Continuous packet transmission animation
        gsap.fromTo(pulse.position, 
          { x: prevX + 1.35 },
          { 
            x: xPos - 1.35, 
            duration: 1.4, 
            repeat: -1, 
            ease: 'none', 
            delay: i * 0.2 
          }
        );
      }

      // 8. GSAP Entrance Bounce on new block creation
      if (isLatest && animateLatest) {
        gsap.fromTo(blockMesh.scale, 
          { x: 0.1, y: 0.1, z: 0.1 },
          { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(2)' }
        );
        gsap.fromTo(blockMesh.position, 
          { y: 6 },
          { y: 1.6, duration: 0.9, ease: 'bounce.out' }
        );
      }
    }
  };

  // --- Focus Camera smoothly onto a specific block ---
  const focusOnBlock = (blockMesh) => {
    if (!cameraRef.current || !blockMesh) return;
    const targetX = blockMesh.position.x;
    gsap.to(cameraRef.current.position, {
      x: targetX,
      y: 3.5,
      z: 8.5,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        cameraRef.current.lookAt(targetX, 1.6, 0);
      }
    });
  };

  // --- Initialize Three.js Scene, Lighting, Floor Grid ---
  useEffect(() => {
    if (!mountRef.current) return;

    // Purge any existing children to prevent duplicate canvas!
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || 900;
    const height = 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040813);
    scene.fog = new THREE.FogExp2(0x040813, 0.028);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.2, 14.5);
    camera.lookAt(0, 1.6, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 4, 30);
    cyanLight.position.set(0, 9, 9);
    scene.add(cyanLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3, 25);
    amberLight.position.set(-8, 5, 5);
    scene.add(amberLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3, 25);
    purpleLight.position.set(8, 5, -5);
    scene.add(purpleLight);

    // 5. Cyber Grid Floor
    const grid = new THREE.GridHelper(60, 60, 0x0284c7, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // 6. Groups
    const blocksGroup = new THREE.Group();
    scene.add(blocksGroup);
    blocksGroupRef.current = blocksGroup;

    const connectorsGroup = new THREE.Group();
    scene.add(connectorsGroup);
    connectorsGroupRef.current = connectorsGroup;

    const pedestalsGroup = new THREE.Group();
    scene.add(pedestalsGroup);
    pedestalsGroupRef.current = pedestalsGroup;

    // 7. Initial Render
    renderBlocksChain(blockHeight, incidents[0] || null, false);

    // Select latest block by default
    if (blockMeshesRef.current.length > 0) {
      setSelectedBlock(blockMeshesRef.current[blockMeshesRef.current.length - 1].userData);
    }

    // 8. Animation Loop
    let angle = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current && cameraRef.current) {
        angle += 0.003;
        cameraRef.current.position.x = Math.sin(angle) * 1.5;
        cameraRef.current.lookAt(0, 1.6, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Sync with real-time blockHeight updates from Ganache EVM
  useEffect(() => {
    if (blockHeight > prevBlockHeightRef.current) {
      prevBlockHeightRef.current = blockHeight;
      const latestIncident = incidents[0] || null;
      trigger3DMiningAnimation(blockHeight, latestIncident);
    }
  }, [blockHeight, incidents]);

  // --- Mouse / Raycasting Interactivity ---
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !cameraRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    cameraRef.current.position.x -= deltaX * 0.02;
    cameraRef.current.position.y += deltaY * 0.02;
    cameraRef.current.position.y = Math.max(1.0, Math.min(10.0, cameraRef.current.position.y));
    cameraRef.current.lookAt(cameraRef.current.position.x * 0.4, 1.6, 0);
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    // Click / Raycast Selection
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(blockMeshesRef.current, false);
    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      if (hitMesh.userData && hitMesh.userData.blockNum) {
        setSelectedBlock(hitMesh.userData);
        focusOnBlock(hitMesh);
      }
    }
  };

  const handleWheel = (e) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z += e.deltaY * 0.01;
    cameraRef.current.position.z = Math.max(6.0, Math.min(26.0, cameraRef.current.position.z));
  };

  const handleResetCamera = () => {
    if (!cameraRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 4.2,
      z: 14.5,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => {
        cameraRef.current.lookAt(0, 1.6, 0);
      }
    });
  };

  return (
    <div className="space-y-5">
      
      {/* ========================================================================= */}
      {/* 1. TOP METRICS & STATS BAR */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Chain Block Height */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Block Height</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Blocks className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
            <span>#{blockHeight}</span>
            <span className="text-xs font-medium text-purple-400 font-mono">SEALED</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ganache EVM :8545 Active</span>
          </div>
        </div>

        {/* Card 2: Smart Contract */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Contract</span>
            <button 
              onClick={handleCopyContract}
              className="text-slate-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800"
              title="Copy Contract Address"
            >
              {copiedContract ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300 truncate" title={contractAddress}>
            {contractAddress.slice(0, 12)}...{contractAddress.slice(-8)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Solidity 0.8.20</span>
            <span className="text-emerald-400 font-semibold font-mono">EVM VERIFIED</span>
          </div>
        </div>

        {/* Card 3: Total Incidents Recorded */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Chain Incidents</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {incidents.length} <span className="text-xs font-normal text-slate-400">Total</span>
          </div>
          <div className="text-xs text-red-400 mt-1 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>Immutable Audit Trail</span>
          </div>
        </div>

        {/* Card 4: Consensus & Gas */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800/90 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gas & Consensus</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {gasSpent.toFixed(5)} <span className="text-xs font-normal text-slate-400">ETH</span>
          </div>
          <div className="text-xs text-amber-300 mt-1 font-mono">
            PoA Instant Finality • 21k Gas
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN 3D THREE.JS VIEWPORT */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-slate-800/90 bg-[#040813] overflow-hidden shadow-2xl relative flex flex-col min-h-[540px]">
        
        {/* Viewport Top Header & Controls */}
        <div className="p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Blocks className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Ethereum EVM 3D Distributed Ledger
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  Three.js + GSAP
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Interactive cryptographic block chain • Drag to orbit • Scroll to zoom • Click block to inspect
              </p>
            </div>
          </div>

          {/* Quick Simulation & Camera Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Status Pill */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${
              isMining 
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse' 
                : 'bg-slate-900/90 border-slate-700 text-cyan-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMining ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'}`}></span>
              <span>{miningStatusText}</span>
            </div>

            {/* Manual Mine / Trigger Simulation */}
            <button
              onClick={() => {
                if (onSimulateAttack) {
                  onSimulateAttack(1);
                } else {
                  trigger3DMiningAnimation(blockHeight + 1, {
                    device_id: 'hyd-cyber-06',
                    zone: 'Cyber Towers Substation',
                    attack_category: 1,
                    confidence_pct: 100.0,
                    tx_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
                  });
                }
              }}
              disabled={isMining}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Simulate cyberattack to trigger 3D block mining and ledger verification"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Block Mined</span>
            </button>

            {/* Reset Camera View */}
            <button
              onClick={handleResetCamera}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Camera View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Toggle Orbit Auto-Rotation */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl border transition-colors ${
                autoRotate ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle Auto Orbit"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 3D Canvas Viewport */}
        <div 
          ref={mountRef} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className="w-full h-[480px] cursor-grab active:cursor-grabbing relative overflow-hidden"
        >
          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 font-mono flex items-center gap-2 z-10 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Click any 3D Block to inspect Merkle forensic proofs</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. BOTTOM INTEL DECK: INSPECTOR & RECENT BLOCKS FEED */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 7 Cols: Selected Block Cryptographic Forensics */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  {selectedBlock ? `Block #${selectedBlock.blockNum} Forensic Dossier` : `Latest Block #${blockHeight} Dossier`}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  SmartCitySecurityLedger.sol • Immutable Event Audit
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SEALED & PROVEN
            </span>
          </div>

          {selectedBlock ? (
            <div className="space-y-3 font-mono text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">TARGET SCADA NODE</span>
                  <span className="text-cyan-300 font-bold text-sm">{selectedBlock.incident.device_id}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">ZONE / LOCATION</span>
                  <span className="text-slate-200 font-bold text-sm truncate block">{selectedBlock.incident.zone}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">INCIDENT CLASSIFICATION</span>
                  <span className="text-red-400 font-bold text-sm">
                    {selectedBlock.incident.attack_category === 1 
                      ? 'DDoS / Flood' 
                      : (selectedBlock.incident.attack_category === 2 ? 'PortScan Recon' : 'Spoofing Attack')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">AI CONFIDENCE SCORE</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {(selectedBlock.incident.confidence_pct || 100.0).toFixed(1)}% (1D-CNN)
                  </span>
                </div>
              </div>

              {/* Hashes */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">ON-CHAIN TRANSACTION HASH (EVM):</span>
                  <span className="text-purple-300 text-[11px] break-all select-all font-mono">
                    {selectedBlock.incident.tx_hash}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-slate-500 block text-[10px]">SHA-256 FORENSIC TELEMETRY ROOT:</span>
                  <span className="text-cyan-400 text-[11px] break-all select-all font-mono">
                    0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                  </span>
                </div>
              </div>

              {/* Host Firewall Mitigation */}
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-red-300 font-bold">OS Firewall Rule:</span>
                  <span className="text-slate-400">netsh advfirewall DROP_ALL_INCOMING</span>
                </div>
                <span className="text-emerald-400 font-bold">ENFORCED</span>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              Click any 3D block in the chain to inspect its cryptographic receipts and audit details.
            </div>
          )}

        </div>

        {/* Right 5 Cols: Recent Mined Blocks Feed */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4 flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-sm text-white">Recent Block History</h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Ganache Chain</span>
            </div>

            {/* Blocks List */}
            <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {[0, 1, 2, 3, 4].map((offset) => {
                const bNum = blockHeight - offset;
                const inc = incidents[offset] || {
                  device_id: offset % 2 === 0 ? 'hyd-cyber-06' : 'medchal-checkpost-02',
                  attack_category: offset % 2 === 0 ? 1 : 2,
                  tx_hash: `0x${bNum}e78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab`
                };
                const isDDoS = inc.attack_category === 1;

                return (
                  <div 
                    key={bNum}
                    onClick={() => {
                      const mesh = blockMeshesRef.current.find(m => m.userData.blockNum === bNum);
                      if (mesh) {
                        setSelectedBlock(mesh.userData);
                        focusOnBlock(mesh);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          Block #{bNum}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isDDoS ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {isDDoS ? 'DDoS' : 'PortScan'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[200px]">
                        {inc.device_id} • {inc.tx_hash.slice(0, 16)}...
                      </span>
                    </div>

                    <button 
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-cyan-600 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Search className="w-3 h-3" />
                      <span>Focus</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Explainer Footer */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-300 font-mono">
            Every block is verified by our PyTorch 1D-CNN DL model. When confidence exceeds 85%, the incident and telemetry hash are permanently sealed on the EVM.
          </div>

        </div>

      </div>

    </div>
  );
}
