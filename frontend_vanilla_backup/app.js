/**
 * Medchal & Greater Hyderabad 3D/2D Geospatial Digital Twin Web Command Center
 * Integrates:
 * 1. Three.js 3D WebGL Isometric Urban Scene (Procedural Buildings, Laser Streams, Volumetric Forcefields)
 * 2. Leaflet.js 2D Cartographic GIS Map (CartoDB Dark Matter, Pulsing Radar Markers, Animated Polylines)
 * 3. Chart.js Real-time Telemetry Velocity (20-point sliding window) & Feature Saliency
 * 4. PyTorch SmartCity1DCNN Neural Visualizer (Layer Activations, Softmax Gauges)
 * 5. Ganache EVM Security Ledger Explorer (Block Receipts, Gas Tracking, SHA-256 Forensics)
 * 6. Socket.IO Live Telemetry & Cyber-Threat Injection Controller
 */

// =============================================================================
// 1. REGIONAL METROPOLITAN NODE REGISTRY (Medchal & Greater Hyderabad)
// =============================================================================
const GATEWAY_COORD = { lat: 17.6275, lon: 78.4835, name: "Medchal Autonomous Cyber Defense HQ" };

const MUNICIPAL_NODES = {
  // --- Medchal North Cluster ---
  "medchal-substation-01": {
    id: "medchal-substation-01",
    code: "MED-IND-02",
    name: "Medchal Industrial Substation",
    cluster: "Medchal North",
    zone: "Industrial Zone A - Substation 33/11kV",
    ip: "10.10.1.10",
    lat: 17.6350,
    lon: 78.4910,
    type: "Power Grid SCADA / 33kV Transformers",
    voltage: 415.2,
    temp: 54.2,
    rate: 22.4,
    status: "Active",
    modelType: "substation"
  },
  "medchal-checkpost-02": {
    id: "medchal-checkpost-02",
    code: "MED-TRAF-01",
    name: "Medchal Highway Checkpost",
    cluster: "Medchal North",
    zone: "National Highway 44 - Toll Surveillance",
    ip: "10.10.2.20",
    lat: 17.6297,
    lon: 78.4814,
    type: "Traffic & ANPR Surveillance Node",
    voltage: 230.1,
    temp: 36.8,
    rate: 18.2,
    status: "Active",
    modelType: "checkpost"
  },
  "medchal-water-03": {
    id: "medchal-water-03",
    code: "MED-WAT-04",
    name: "Medchal Municipal Water Plant",
    cluster: "Medchal North",
    zone: "Municipal Water Treatment & Reservoir",
    ip: "10.10.3.30",
    lat: 17.6320,
    lon: 78.4780,
    type: "Water SCADA Flow & Pressure Sensor",
    voltage: 229.8,
    temp: 28.4,
    rate: 14.5,
    status: "Active",
    modelType: "reservoir"
  },
  "medchal-streetlight-04": {
    id: "medchal-streetlight-04",
    code: "MED-ENV-03",
    name: "Kandlakoya Junction Smart Lighting",
    cluster: "Medchal North",
    zone: "Kandlakoya Junction Ambient IoT & Oxygen Park",
    ip: "10.10.4.40",
    lat: 17.6080,
    lon: 78.4900,
    type: "IoT Streetlight & Ambient Sensor Mesh",
    voltage: 230.4,
    temp: 31.2,
    rate: 19.8,
    status: "Active",
    modelType: "lighting"
  },
  "medchal-phc-05": {
    id: "medchal-phc-05",
    code: "MED-ORR-05",
    name: "ORR Exit 6 Toll & PHC Cold-Chain",
    cluster: "Medchal North",
    zone: "Outer Ring Road Exit 6 Corridor",
    ip: "10.10.5.50",
    lat: 17.6185,
    lon: 78.4735,
    type: "Healthcare Cold-Chain & Toll Gateway",
    voltage: 231.0,
    temp: 4.5,
    rate: 16.0,
    status: "Active",
    modelType: "toll"
  },

  // --- Greater Hyderabad Metropolitan Clusters ---
  "hyd-cyber-06": {
    id: "hyd-cyber-06",
    code: "HYD-CYBER-06",
    name: "HITEC City Cyber Towers",
    cluster: "Madhapur / Cyberabad",
    zone: "IT Corridor High-Density Fiber Backbone",
    ip: "10.20.1.10",
    lat: 17.4504,
    lon: 78.3808,
    type: "High-Density Fiber SCADA & Smart Grid",
    voltage: 240.2,
    temp: 24.5,
    rate: 45.2,
    status: "Active",
    modelType: "cybertowers"
  },
  "hyd-fin-07": {
    id: "hyd-fin-07",
    code: "HYD-FIN-07",
    name: "Gachibowli Financial District",
    cluster: "Gachibowli",
    zone: "Banking & FinTech Critical Infrastructure",
    ip: "10.20.2.20",
    lat: 17.4156,
    lon: 78.3427,
    type: "Financial Data Center Power Grid SCADA",
    voltage: 415.8,
    temp: 22.0,
    rate: 38.6,
    status: "Active",
    modelType: "skyscraper"
  },
  "hyd-sc-08": {
    id: "hyd-sc-08",
    code: "HYD-SC-08",
    name: "Secunderabad Transit Hub",
    cluster: "Secunderabad",
    zone: "Railway Operations & Intermodal SCADA",
    ip: "10.20.3.30",
    lat: 17.4399,
    lon: 78.4983,
    type: "Railway Signalling & Transit Microgrid",
    voltage: 230.5,
    temp: 33.1,
    rate: 28.4,
    status: "Active",
    modelType: "railway"
  },
  "hyd-air-09": {
    id: "hyd-air-09",
    code: "HYD-AIR-09",
    name: "Shamshabad RGIA Airport Gateway",
    cluster: "South Hyderabad",
    zone: "Aviation Security & Airside Energy SCADA",
    ip: "10.20.4.40",
    lat: 17.2403,
    lon: 78.4294,
    type: "Airport Airside & Energy SCADA",
    voltage: 415.0,
    temp: 29.8,
    rate: 52.0,
    status: "Active",
    modelType: "airport"
  },
  "hyd-old-10": {
    id: "hyd-old-10",
    code: "HYD-OLD-10",
    name: "Charminar Heritage Smart Grid",
    cluster: "Old City",
    zone: "Heritage Tourism & Smart Municipal Grid",
    ip: "10.20.5.50",
    lat: 17.3616,
    lon: 78.4747,
    type: "Heritage Environmental & Power Sensor",
    voltage: 230.0,
    temp: 34.0,
    rate: 15.1,
    status: "Active",
    modelType: "heritage"
  }
};

let selectedNodeId = "medchal-substation-01";
let currentViewMode = "3d"; // '3d', '2d', or 'split'
let blockHeight = 5;
let ethSpent = 0.005265;
let autoRotateScene = true;

// =============================================================================
// 2. 3D WEBGL ENGINE (Three.js Isometric Digital Twin)
// =============================================================================
let scene, camera, renderer, controls;
let threeObjects = {
  buildings: {},
  nodes: {},
  lasers: {},
  forcefields: {},
  particles: [],
  gridHelper: null
};

function initThreeScene() {
  const container = document.getElementById("three-container");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080f);
  scene.fog = new THREE.FogExp2(0x05080f, 0.0035);

  // Perspective Camera angled in isometric perspective
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
  camera.position.set(0, 160, 220);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground
  controls.minDistance = 40;
  controls.maxDistance = 450;
  controls.target.set(0, 15, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
  dirLight.position.set(100, 200, 100);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const purpleLight = new THREE.PointLight(0xa855f7, 2, 300);
  purpleLight.position.set(-80, 120, -60);
  scene.add(purpleLight);

  // Holographic Ground Matrix Grid
  const gridHelper = new THREE.GridHelper(360, 60, 0x0284c7, 0x0f172a);
  gridHelper.position.y = 0;
  scene.add(gridHelper);
  threeObjects.gridHelper = gridHelper;

  // Radar Scan Disc
  createRadarScanDisc();

  // Create Central Gateway Hub Model
  createGatewayTower();

  // Build Procedural 3D City Nodes
  createCityNodeObjects();

  // Create Interactive Raycaster for 3D Node Clicking
  setupThreeRaycaster(container);

  // Resize handler
  window.addEventListener("resize", onWindowResize);

  // Animation Loop
  animateThreeScene();
}

function createRadarScanDisc() {
  const geometry = new THREE.RingGeometry(20, 180, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x0284c7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.12,
    wireframe: true
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.5;
  scene.add(ring);
  threeObjects.radarRing = ring;
}

function createGatewayTower() {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  // Base Pedestal
  const baseGeom = new THREE.CylinderGeometry(10, 14, 4, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
  const base = new THREE.Mesh(baseGeom, baseMat);
  base.position.y = 2;
  group.add(base);

  // Spire Body
  const spireGeom = new THREE.CylinderGeometry(3, 7, 30, 8);
  const spireMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.9, emissive: 0x0369a1, emissiveIntensity: 0.3 });
  const spire = new THREE.Mesh(spireGeom, spireMat);
  spire.position.y = 17;
  group.add(spire);

  // Floating Gateway Beacon Core
  const beaconGeom = new THREE.OctahedronGeometry(4);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
  const beacon = new THREE.Mesh(beaconGeom, beaconMat);
  beacon.position.y = 35;
  group.add(beacon);
  threeObjects.gatewayBeacon = beacon;

  // Pulsing Halo Ring
  const haloGeom = new THREE.TorusGeometry(8, 0.4, 8, 32);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
  const halo = new THREE.Mesh(haloGeom, haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 35;
  group.add(halo);
  threeObjects.gatewayHalo = halo;

  scene.add(group);
}

// Convert Geo coordinates to 3D Space Coordinates (Scaled for Isometric viewing)
function geoTo3D(lat, lon) {
  const centerLat = 17.50;
  const centerLon = 78.43;
  const scale = 360; // Coordinate projection scaling factor
  
  const x = (lon - centerLon) * scale;
  const z = -(lat - centerLat) * scale; // Invert lat for Three.js Z axis
  return { x, z };
}

function createCityNodeObjects() {
  Object.values(MUNICIPAL_NODES).forEach(node => {
    const pos = geoTo3D(node.lat, node.lon);
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(pos.x, 0, pos.z);
    nodeGroup.userData = { nodeId: node.id };

    // Building Geometry based on Architectural Type
    let buildingMesh;
    if (node.modelType === "cybertowers") {
      // Cylindrical multi-level Cyber Towers with spires
      buildingMesh = createCyberTowersModel();
    } else if (node.modelType === "skyscraper") {
      // Modern high-rise financial district tower
      buildingMesh = createSkyscraperModel(12, 38, 12, 0x0284c7);
    } else if (node.modelType === "substation") {
      // Industrial electrical substation with power pylons
      buildingMesh = createSubstationModel();
    } else if (node.modelType === "airport") {
      // Airport terminal with glass runway canopy
      buildingMesh = createAirportModel();
    } else if (node.modelType === "heritage") {
      // Charminar 4-spire heritage gate model
      buildingMesh = createCharminarModel();
    } else {
      // Standard SCADA municipal telemetry mast
      buildingMesh = createDefaultNodeModel();
    }

    nodeGroup.add(buildingMesh);

    // Floating Node Status Beacon
    const beaconGeom = new THREE.SphereGeometry(1.8, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.y = 28;
    nodeGroup.add(beacon);

    // Volumetric Quarantine Forcefield (Translucent Geodesic Wireframe Dome)
    const domeGeom = new THREE.SphereGeometry(16, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.0
    });
    const dome = new THREE.Mesh(domeGeom, domeMat);
    dome.position.y = 0;
    nodeGroup.add(dome);

    scene.add(nodeGroup);

    threeObjects.nodes[node.id] = {
      group: nodeGroup,
      beacon: beacon,
      dome: dome,
      building: buildingMesh
    };

    // Laser Telemetry Conduit from Node to Central Gateway
    createLaserConduit(node.id, pos.x, pos.z);
  });
}

function createCyberTowersModel() {
  const group = new THREE.Group();
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 10, 36, 16),
    new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.2, metalness: 0.8, emissive: 0x083344 })
  );
  cylinder.position.y = 18;
  group.add(cylinder);

  const spire = new THREE.Mesh(
    new THREE.ConeGeometry(3, 14, 8),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
  );
  spire.position.y = 43;
  group.add(spire);
  return group;
}

function createSkyscraperModel(w, h, d, color) {
  const group = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.1, metalness: 0.9 })
  );
  tower.position.y = h / 2;
  group.add(tower);
  return group;
}

function createSubstationModel() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(16, 6, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
  );
  base.position.y = 3;
  group.add(base);

  // Electrical Transformer Tanks
  for (let i = -4; i <= 4; i += 8) {
    const pylon = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.5, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
    );
    pylon.position.set(i, 11, 0);
    group.add(pylon);
  }
  return group;
}

function createAirportModel() {
  const group = new THREE.Group();
  const terminal = new THREE.Mesh(
    new THREE.BoxGeometry(28, 8, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
  );
  terminal.position.y = 4;
  group.add(terminal);

  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 3, 24, 8),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
  );
  tower.position.set(10, 12, 0);
  group.add(tower);
  return group;
}

function createCharminarModel() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(12, 10, 12),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
  );
  base.position.y = 5;
  group.add(base);

  // 4 Minarets
  const offsets = [[-5, -5], [5, -5], [-5, 5], [5, 5]];
  offsets.forEach(([ox, oz]) => {
    const minaret = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.2, 20, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })
    );
    minaret.position.set(ox, 10, oz);
    group.add(minaret);
  });
  return group;
}

function createDefaultNodeModel() {
  const group = new THREE.Group();
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 2, 20, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
  );
  mast.position.y = 10;
  group.add(mast);
  return group;
}

function createLaserConduit(nodeId, x, z) {
  // Curved laser telemetry beam
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(x, 15, z),
    new THREE.Vector3(x / 2, 45, z / 2),
    new THREE.Vector3(0, 30, 0)
  );

  const points = curve.getPoints(30);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.45,
    linewidth: 2
  });

  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // Moving telemetry photon packet along curve
  const packetGeom = new THREE.SphereGeometry(1.0, 8, 8);
  const packetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const packet = new THREE.Mesh(packetGeom, packetMat);
  scene.add(packet);

  threeObjects.lasers[nodeId] = {
    line: line,
    curve: curve,
    packet: packet,
    progress: Math.random() // staggered start
  };
}

function setupThreeRaycaster(container) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener("click", event => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      let current = intersects[0].object;
      while (current.parent && !current.userData.nodeId) {
        current = current.parent;
      }
      if (current.userData && current.userData.nodeId) {
        selectNode(current.userData.nodeId);
      }
    }
  });
}

function animateThreeScene() {
  requestAnimationFrame(animateThreeScene);

  const time = performance.now() * 0.001;

  // Gentle orbit if enabled
  if (autoRotateScene && controls && currentViewMode === '3d') {
    scene.rotation.y += 0.0008;
  }

  // Rotate gateway beacon
  if (threeObjects.gatewayBeacon) {
    threeObjects.gatewayBeacon.rotation.y += 0.02;
    threeObjects.gatewayBeacon.rotation.x += 0.01;
  }
  if (threeObjects.gatewayHalo) {
    threeObjects.gatewayHalo.rotation.z += 0.015;
  }

  // Animate laser photon packets
  Object.values(threeObjects.lasers).forEach(l => {
    l.progress += 0.01;
    if (l.progress > 1.0) l.progress = 0.0;
    const point = l.curve.getPoint(l.progress);
    l.packet.position.copy(point);
  });

  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("three-container");
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function resetCameraView() {
  if (!camera || !controls) return;
  scene.rotation.y = 0;
  camera.position.set(0, 160, 220);
  controls.target.set(0, 15, 0);
  controls.update();
}

function toggleGridRotation() {
  autoRotateScene = !autoRotateScene;
}


// =============================================================================
// 3. 2D GIS MAP ENGINE (Leaflet.js Cartographic Digital Twin)
// =============================================================================
let leafletMap;
let leafletMarkers = {};
let leafletPolylines = {};

function initLeafletMap() {
  const container = document.getElementById("map-container");
  if (!container) return;

  // Centered on Hyderabad/Medchal regional corridor
  leafletMap = L.map('map-container', {
    zoomControl: false,
    attributionControl: false
  }).setView([17.50, 78.44], 11);

  // CartoDB Dark Matter Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(leafletMap);

  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

  // Add Central Gateway Marker
  const gatewayIcon = L.divIcon({
    className: 'custom-gateway-icon',
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-950 border-2 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.7)] text-cyan-300">
        <i class="fa-solid fa-satellite-dish text-base"></i>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  const gatewayMarker = L.marker([GATEWAY_COORD.lat, GATEWAY_COORD.lon], { icon: gatewayIcon }).addTo(leafletMap);
  gatewayMarker.bindPopup(`
    <div class="p-2 font-mono">
      <div class="font-bold text-cyan-400 text-sm mb-1">${GATEWAY_COORD.name}</div>
      <div class="text-xs text-slate-300">Port 5000 Ingestion Gateway</div>
      <div class="text-[10px] text-slate-400 mt-1">EVM Security Contract & 1D-CNN Evaluator</div>
    </div>
  `);

  // Add Municipal Nodes Markers & Polylines
  Object.values(MUNICIPAL_NODES).forEach(node => {
    const isQuarantined = node.status === "Quarantined";
    const markerColor = isQuarantined ? "#ef4444" : "#38bdf8";
    const haloClass = isQuarantined ? "pulsing-marker-crimson" : "pulsing-marker-cyan";

    const nodeIcon = L.divIcon({
      className: haloClass,
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2" style="border-color: ${markerColor}; color: ${markerColor}; box-shadow: 0 0 12px ${markerColor};">
          <i class="fa-solid fa-shield-halved text-xs"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([node.lat, node.lon], { icon: nodeIcon }).addTo(leafletMap);
    marker.on("click", () => selectNode(node.id));

    marker.bindPopup(`
      <div class="p-2 font-mono">
        <div class="font-bold text-sm" style="color: ${markerColor}">${node.name} (${node.code})</div>
        <div class="text-xs text-slate-300 mt-1">${node.zone}</div>
        <div class="text-xs text-slate-400 mt-0.5">IP: <span class="text-cyan-400">${node.ip}</span></div>
        <div class="text-xs text-slate-400">Rate: <span class="text-slate-200">${node.rate} pkt/s</span> | Status: <span class="font-bold uppercase" style="color: ${markerColor}">${node.status}</span></div>
        <div class="mt-2 pt-2 border-t border-slate-700 flex gap-2">
          <button onclick="injectThreat(1, '${node.id}')" class="px-2 py-1 bg-red-950/80 text-red-300 border border-red-500/40 rounded text-[10px]">Attack</button>
          <button onclick="reinstateNode('${node.id}')" class="px-2 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded text-[10px]">Reinstate</button>
        </div>
      </div>
    `);

    leafletMarkers[node.id] = marker;

    // Glowing SVG Polyline linking to Gateway
    const polylineColor = isQuarantined ? "#ef4444" : "#38bdf8";
    const polyline = L.polyline([[node.lat, node.lon], [GATEWAY_COORD.lat, GATEWAY_COORD.lon]], {
      color: polylineColor,
      weight: isQuarantined ? 3 : 2,
      opacity: 0.7,
      className: isQuarantined ? 'leaflet-quarantine-line' : ''
    }).addTo(leafletMap);

    leafletPolylines[node.id] = polyline;
  });
}


// =============================================================================
// 4. CHARTS ENGINE (Real-time Velocity & Feature Saliency)
// =============================================================================
let velocityChart, featureChart;
const MAX_VELOCITY_POINTS = 20;

function initCharts() {
  // 1. Packet Velocity Sliding Window (Chart.js)
  const vCtx = document.getElementById("velocityChart");
  if (vCtx) {
    const labels = Array.from({ length: MAX_VELOCITY_POINTS }, (_, i) => `${i * 2}s`);
    const data = Array.from({ length: MAX_VELOCITY_POINTS }, () => Math.round(18 + Math.random() * 8));

    velocityChart = new Chart(vCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Packet Velocity (pkt/s)',
          data: data,
          borderColor: '#38bdf8',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(56, 189, 248, 0.08)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: {
            display: true,
            grid: { color: 'rgba(30, 41, 59, 0.5)' },
            ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 9 } }
          }
        }
      }
    });
  }

  // 2. Feature Saliency Bar Chart
  const fCtx = document.getElementById("featureChart");
  if (fCtx) {
    featureChart = new Chart(fCtx, {
      type: 'bar',
      data: {
        labels: ['Rate', 'IAT', 'TotSum', 'Header', 'SYN', 'RST'],
        datasets: [{
          data: [85, 92, 78, 64, 98, 88],
          backgroundColor: [
            'rgba(56, 189, 248, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(56, 189, 248, 0.7)',
            'rgba(100, 116, 139, 0.7)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 9 } }
          },
          y: {
            max: 100,
            grid: { color: 'rgba(30, 41, 59, 0.5)' },
            ticks: { display: false }
          }
        }
      }
    });
  }
}

function pushVelocityReading(val) {
  if (!velocityChart) return;
  const data = velocityChart.data.datasets[0].data;
  data.shift();
  data.push(val);
  velocityChart.update('none');

  const display = document.getElementById("current-velocity-display");
  if (display) display.textContent = `${val.toFixed(1)} pkt/s`;
}


// =============================================================================
// 5. VIEWPORT MODE SWITCHER (3D / 2D / SPLIT)
// =============================================================================
function switchViewMode(mode) {
  currentViewMode = mode;
  const threeContainer = document.getElementById("three-container");
  const mapContainer = document.getElementById("map-container");
  const label = document.getElementById("active-viewport-label");

  // Reset button states
  document.querySelectorAll("[id^='btn-view-']").forEach(btn => {
    btn.className = "px-3 py-1 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1.5 text-slate-400 hover:text-slate-200";
  });
  const activeBtn = document.getElementById(`btn-view-${mode}`);
  if (activeBtn) {
    activeBtn.className = "px-3 py-1 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm";
  }

  if (mode === '3d') {
    threeContainer.className = "absolute inset-0 w-full h-full z-10 block";
    mapContainer.className = "absolute inset-0 w-full h-full z-0 hidden";
    label.textContent = "3D HOLOGRAPHIC TWIN VIEWPORT";
    onWindowResize();
  } else if (mode === '2d') {
    threeContainer.className = "absolute inset-0 w-full h-full z-0 hidden";
    mapContainer.className = "absolute inset-0 w-full h-full z-10 block";
    label.textContent = "2D CARTOGRAPHIC GIS VIEWPORT";
    if (leafletMap) leafletMap.invalidateSize();
  } else if (mode === 'split') {
    threeContainer.className = "absolute top-0 left-0 w-1/2 h-full z-10 block border-r border-slate-700/60";
    mapContainer.className = "absolute top-0 right-0 w-1/2 h-full z-10 block";
    label.textContent = "DUAL 3D TWIN + 2D GIS SPLIT MODE";
    onWindowResize();
    if (leafletMap) leafletMap.invalidateSize();
  }
}


// =============================================================================
// 6. NODE SELECTION & HUD UPDATES
// =============================================================================
function selectNode(nodeId) {
  const node = MUNICIPAL_NODES[nodeId];
  if (!node) return;

  selectedNodeId = nodeId;

  // Update HUD bottom strip
  document.getElementById("hud-node-name").textContent = `${node.name} (${node.code})`;
  document.getElementById("hud-node-ip").textContent = node.ip;
  document.getElementById("hud-node-zone").textContent = node.zone;
  document.getElementById("coords-display").textContent = `${node.lat.toFixed(4)}° N, ${node.lon.toFixed(4)}° E`;

  const statusBadge = document.getElementById("hud-node-status");
  if (node.status === "Quarantined") {
    statusBadge.className = "px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 font-bold uppercase";
    statusBadge.textContent = "Quarantined";
  } else {
    statusBadge.className = "px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold uppercase";
    statusBadge.textContent = "Active";
  }

  // Highlight in Left Dock list
  renderNodeList();

  // Focus Camera in 3D Scene
  if (threeObjects.nodes[nodeId]) {
    const pos = geoTo3D(node.lat, node.lon);
    controls.target.set(pos.x, 15, pos.z);
    camera.position.set(pos.x + 30, 60, pos.z + 50);
  }

  // Focus 2D Leaflet Map
  if (leafletMap) {
    leafletMap.panTo([node.lat, node.lon], { animate: true, duration: 1.0 });
    if (leafletMarkers[nodeId]) leafletMarkers[nodeId].openPopup();
  }
}

function renderNodeList() {
  const container = document.getElementById("node-list-container");
  if (!container) return;

  container.innerHTML = "";
  Object.values(MUNICIPAL_NODES).forEach(node => {
    const isSelected = node.id === selectedNodeId;
    const isQuarantined = node.status === "Quarantined";

    const card = document.createElement("div");
    card.className = `p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
      isSelected 
        ? 'bg-slate-800/90 border-cyan-500/60 shadow-[0_0_10px_rgba(56,189,248,0.2)]' 
        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
    }`;

    card.onclick = () => selectNode(node.id);

    const statusDot = isQuarantined ? "bg-red-500 animate-ping" : "bg-emerald-400";
    const statusText = isQuarantined ? "text-red-400 font-bold" : "text-emerald-400";

    card.innerHTML = `
      <div class="flex items-center gap-2 truncate pr-2">
        <span class="w-2 h-2 rounded-full ${statusDot} shrink-0"></span>
        <div class="truncate">
          <div class="font-bold text-slate-200 truncate">${node.name}</div>
          <div class="text-[10px] text-slate-400 truncate">${node.cluster} • ${node.code}</div>
        </div>
      </div>
      <div class="text-right shrink-0">
        <div class="${statusText} text-[10px] uppercase">${node.status}</div>
        <div class="text-[10px] text-slate-400">${node.rate.toFixed(1)} pkt/s</div>
      </div>
    `;

    container.appendChild(card);
  });
}


// =============================================================================
// 7. CYBERATTACK INJECTION & AUTONOMOUS DEFENSE
// =============================================================================
function injectThreat(attackType, targetNodeId) {
  const node = MUNICIPAL_NODES[targetNodeId];
  if (!node) return;

  selectNode(targetNodeId);

  // Generate synthetic vector matching attack type
  let flowVector = [0.0] * 46;
  let attackLabel = attackType === 1 ? "DDOS-SYN_FLOOD" : "RECON-PORTSCAN";
  let velocity = attackType === 1 ? 4200.0 : 380.0;

  pushVelocityReading(velocity);

  // Mark node as Quarantined in memory
  applyQuarantineState(targetNodeId, attackLabel, 1.0);

  // Transmit to backend server
  const payload = {
    node_id: targetNodeId,
    node_name: node.name,
    municipal_zone: node.zone,
    attack_mode: attackType,
    flow_stats: [
      19.88, 6.0, 64.0, velocity, 0.0, 0.0, 0.0, 0.0, (attackType === 1 ? 1.0 : 0.0), 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, (attackType === 2 ? 35.0 : 0.0), 0.0,
      0.0, 0.0, 0.99, 0.01, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
      6018.0, 60.0, 78.0, 60.18, 1.8, 60.18, 0.0001, 100.0, 3.24,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ],
    sensor_telemetry: {
      voltage: node.voltage,
      temp: node.temp + (attackType === 1 ? 15.0 : 4.0),
      anomalous_burst: true
    }
  };

  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.quarantine && data.quarantine.tx_hash) {
      addIncidentToFeed({
        device_id: targetNodeId,
        zone: node.zone,
        attack_category: attackType,
        confidence_pct: 100.0,
        tx_hash: data.quarantine.tx_hash,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }
  })
  .catch(err => {
    console.log("Local offline defense fallback active:", err);
    // Generate simulated blockchain receipt
    addIncidentToFeed({
      device_id: targetNodeId,
      zone: node.zone,
      attack_category: attackType,
      confidence_pct: 100.0,
      tx_hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: Math.floor(Date.now() / 1000)
    });
  });
}

function applyQuarantineState(nodeId, threatName, confidence) {
  const node = MUNICIPAL_NODES[nodeId];
  if (!node) return;

  node.status = "Quarantined";

  // Trigger HUD Threat Siren
  const siren = document.getElementById("threat-indicator-pill");
  if (siren) siren.classList.remove("hidden");

  // Update 3D Scene: Activate Translucent Red Forcefield Dome
  if (threeObjects.nodes[nodeId]) {
    threeObjects.nodes[nodeId].beacon.material.color.setHex(0xef4444);
    threeObjects.nodes[nodeId].dome.material.opacity = 0.6; // Red wireframe forcefield active
  }
  if (threeObjects.lasers[nodeId]) {
    threeObjects.lasers[nodeId].line.material.color.setHex(0xef4444);
    threeObjects.lasers[nodeId].packet.material.color.setHex(0xef4444);
  }

  // Update 2D Leaflet Marker & Polyline
  if (leafletMarkers[nodeId]) {
    const crimsonIcon = L.divIcon({
      className: "pulsing-marker-crimson",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-950 border-2 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]">
          <i class="fa-solid fa-triangle-exclamation text-xs animate-bounce"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    leafletMarkers[nodeId].setIcon(crimsonIcon);
  }

  if (leafletPolylines[nodeId]) {
    leafletPolylines[nodeId].setStyle({
      color: "#ef4444",
      weight: 3,
      className: "leaflet-quarantine-line"
    });
  }

  // Update AI Visualizer
  document.getElementById("ai-prediction-label").textContent = threatName;
  document.getElementById("ai-prediction-label").className = "font-bold text-red-400";
  document.getElementById("ai-confidence-value").textContent = `${(confidence * 100).toFixed(2)}% (${Math.round(confidence * 10000)} bps)`;
  document.getElementById("ai-confidence-bar").className = "bg-gradient-to-r from-red-500 to-amber-400 h-2 transition-all duration-300";

  // Re-render Left Dock
  renderNodeList();
  selectNode(nodeId);
}

function reinstateNode(nodeId) {
  const node = MUNICIPAL_NODES[nodeId];
  if (!node) return;

  node.status = "Active";

  fetch("/api/reinstate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node_id: nodeId })
  }).catch(e => console.log("Reinstate RPC fallback:", e));

  // Reset 3D Scene
  if (threeObjects.nodes[nodeId]) {
    threeObjects.nodes[nodeId].beacon.material.color.setHex(0x10b981);
    threeObjects.nodes[nodeId].dome.material.opacity = 0.0;
  }
  if (threeObjects.lasers[nodeId]) {
    threeObjects.lasers[nodeId].line.material.color.setHex(0x38bdf8);
    threeObjects.lasers[nodeId].packet.material.color.setHex(0x38bdf8);
  }

  // Reset 2D Leaflet Marker & Polyline
  if (leafletMarkers[nodeId]) {
    const cyanIcon = L.divIcon({
      className: "pulsing-marker-cyan",
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]">
          <i class="fa-solid fa-shield-halved text-xs"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    leafletMarkers[nodeId].setIcon(cyanIcon);
  }

  if (leafletPolylines[nodeId]) {
    leafletPolylines[nodeId].setStyle({
      color: "#38bdf8",
      weight: 2,
      className: ""
    });
  }

  // Check if any nodes remain quarantined
  const remainingThreats = Object.values(MUNICIPAL_NODES).some(n => n.status === "Quarantined");
  if (!remainingThreats) {
    const siren = document.getElementById("threat-indicator-pill");
    if (siren) siren.classList.add("hidden");
    document.getElementById("ai-prediction-label").textContent = "Benign Traffic";
    document.getElementById("ai-prediction-label").className = "font-bold text-emerald-400";
    document.getElementById("ai-confidence-bar").className = "bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 transition-all duration-300";
  }

  renderNodeList();
  selectNode(nodeId);
}

function reinstateAllNodes() {
  Object.keys(MUNICIPAL_NODES).forEach(id => reinstateNode(id));
}


// =============================================================================
// 8. BLOCKCHAIN SECURITY LEDGER AUDIT FEED
// =============================================================================
function addIncidentToFeed(incident) {
  const container = document.getElementById("ledger-incident-feed");
  if (!container) return;

  blockHeight += 1;
  ethSpent += 0.000254;

  document.getElementById("block-height-counter").textContent = `#${blockHeight}`;
  document.getElementById("gas-spent-counter").textContent = `${ethSpent.toFixed(6)} ETH`;

  const card = document.createElement("div");
  card.className = "p-2 rounded-lg bg-slate-900/90 border border-red-500/40 font-mono text-[10px] space-y-1 shadow-md";

  const categoryName = incident.attack_category === 1 ? "DDoS / Flood" : (incident.attack_category === 2 ? "PortScan" : "Anomaly");
  const timeStr = new Date(incident.timestamp * 1000).toLocaleTimeString();

  card.innerHTML = `
    <div class="flex items-center justify-between text-red-400 font-bold">
      <span class="flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation"></i> ${categoryName}</span>
      <span class="text-slate-400 text-[9px]">${timeStr}</span>
    </div>
    <div class="text-slate-300 truncate">Device: <span class="text-cyan-400 font-bold">${incident.device_id}</span></div>
    <div class="text-slate-400 truncate">Zone: ${incident.zone}</div>
    <div class="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px]">
      <span class="text-purple-300">Conf: ${incident.confidence_pct.toFixed(2)}%</span>
      <span class="text-cyan-400 truncate max-w-[120px]" title="${incident.tx_hash}">${incident.tx_hash.substring(0, 14)}...</span>
    </div>
  `;

  container.insertBefore(card, container.firstChild);
}


// =============================================================================
// 9. SOCKET.IO INTEGRATION & REAL-TIME EVENT STREAM
// =============================================================================
function setupSocketIO() {
  try {
    const socket = io(window.location.origin, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      console.log("[WebSocket] Connected to Edge Gateway:", socket.id);
      document.getElementById("gateway-status-text").textContent = "ONLINE";
      document.getElementById("gateway-status-text").className = "text-emerald-400 font-bold";
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from Edge Gateway");
      document.getElementById("gateway-status-text").textContent = "OFFLINE";
      document.getElementById("gateway-status-text").className = "text-amber-400 font-bold";
    });

    socket.on("telemetry_stream", data => {
      if (!data) return;

      const nodeId = data.node ? data.node.id : null;
      if (nodeId && MUNICIPAL_NODES[nodeId]) {
        MUNICIPAL_NODES[nodeId].rate = data.classification.is_threat ? 3500.0 : (15.0 + Math.random() * 10.0);
        pushVelocityReading(MUNICIPAL_NODES[nodeId].rate);

        if (data.quarantine_enforced) {
          applyQuarantineState(nodeId, data.classification.class_label, data.classification.confidence);
          if (data.blockchain_receipt && data.blockchain_receipt.tx_hash) {
            addIncidentToFeed({
              device_id: nodeId,
              zone: data.node.zone,
              attack_category: data.classification.predicted_class,
              confidence_pct: data.classification.confidence * 100,
              tx_hash: data.blockchain_receipt.tx_hash,
              timestamp: data.timestamp
            });
          }
        }
      }
    });

    socket.on("node_status_change", data => {
      if (data && data.node_id && data.status === "Active") {
        reinstateNode(data.node_id);
      }
    });

  } catch (e) {
    console.log("[WebSocket Note] Operating in autonomous local simulation:", e);
  }
}


// =============================================================================
// 10. IEEE PUBLICATION VISUALIZATIONS MODAL LOGIC
// =============================================================================
const IEEE_FIGURES = {
  1: {
    src: "/ieee_figures/fig1_convergence_curves.png",
    caption: "Fig. 1: Cross-entropy loss and accuracy curves across 20 training epochs illustrating smooth convergence on NVIDIA RTX 3050 GPU (98.69% Test Accuracy)."
  },
  2: {
    src: "/ieee_figures/fig2_confusion_matrix.png",
    caption: "Fig. 2: Multi-class confusion matrix showing absolute classification counts and normalized true positive rates across 368,243 test split records."
  },
  3: {
    src: "/ieee_figures/fig3_roc_curves.png",
    caption: "Fig. 3: One-vs-Rest Receiver Operating Characteristic (ROC) curves across Benign, DDoS, Recon, and Spoofing classes with a Macro-Average AUC of 0.9959."
  },
  4: {
    src: "/ieee_figures/fig4_precision_recall_curves.png",
    caption: "Fig. 4: Precision-Recall curves under class imbalance demonstrating resilient multi-class detection fidelity (Mean AP = 0.9885)."
  },
  5: {
    src: "/ieee_figures/fig5_per_class_metrics.png",
    caption: "Fig. 5: Grouped bar benchmark of Precision, Recall, and F1-Scores across all 4 operational target classes."
  },
  6: {
    src: "/ieee_figures/fig6_feature_importance.png",
    caption: "Fig. 6: Top-15 network flow feature contributions derived from 1D-CNN convolutional filter attribution (Rate, IAT, and Tot sum as key discriminators)."
  },
  7: {
    src: "/ieee_figures/fig7_model_architecture.png",
    caption: "Fig. 7: End-to-end layered topology of SmartCity1DCNN showing sequential 1D convolutions, batch normalization, LeakyReLU activations, adaptive pooling, and classification head."
  }
};

function openIeeeModal() {
  document.getElementById("ieee-modal").classList.remove("hidden");
  showIeeeFig(1);
}

function closeIeeeModal() {
  document.getElementById("ieee-modal").classList.add("hidden");
}

function showIeeeFig(figNum) {
  const fig = IEEE_FIGURES[figNum];
  if (!fig) return;

  document.getElementById("ieee-fig-img").src = fig.src;
  document.getElementById("ieee-fig-caption").textContent = fig.caption;

  document.querySelectorAll(".fig-tab-btn").forEach(btn => {
    if (parseInt(btn.getAttribute("data-fig")) === figNum) {
      btn.className = "fig-tab-btn px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40";
    } else {
      btn.className = "fig-tab-btn px-2.5 py-1 rounded text-slate-400 hover:text-slate-200";
    }
  });
}


// =============================================================================
// 11. INITIALIZATION & HEARTBEAT
// =============================================================================
window.addEventListener("DOMContentLoaded", () => {
  console.log("[Init] Booting Medchal & Greater Hyderabad 3D/2D Digital Twin Command Center...");
  
  initThreeScene();
  initLeafletMap();
  initCharts();
  renderNodeList();
  selectNode("medchal-substation-01");
  setupSocketIO();

  // Populate initial verified incident from Ganache testnet
  addIncidentToFeed({
    device_id: "medchal-checkpost-02",
    zone: "National Highway 44 - Toll Checkpost",
    attack_category: 1,
    confidence_pct: 100.0,
    tx_hash: "0x3c2d0cae2b5aeedfa45260328a2df39c27a9f40c3c90286c3691a504f3e00fe8",
    timestamp: Math.floor(Date.now() / 1000) - 120
  });

  // Background Autonomous Telemetry Pulse (Keeps interface alive if simulation paused)
  setInterval(() => {
    const randomPkt = 18.0 + Math.random() * 8.0;
    pushVelocityReading(randomPkt);
  }, 2000);
});
