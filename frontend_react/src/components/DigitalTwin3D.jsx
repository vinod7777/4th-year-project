import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function DigitalTwin3D({ nodes, selectedNodeId, onSelectNode, autoRotate = true }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const threeObjectsRef = useRef({
    nodes: {},
    lasers: {},
    gatewayBeacon: null,
    gatewayHalo: null,
    radarRing: null
  });

  // Projection formula from Lat/Lon to 3D Plane coordinates
  const geoTo3D = (lat, lon) => {
    const centerLat = 17.50;
    const centerLon = 78.43;
    const scale = 360;
    const x = (lon - centerLon) * scale;
    const z = -(lat - centerLat) * scale;
    return { x, z };
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x05080f);
    scene.fog = new THREE.FogExp2(0x05080f, 0.0032);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 160, 220);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 40;
    controls.maxDistance = 500;
    controls.target.set(0, 15, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(120, 200, 100);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 2, 350);
    purpleLight.position.set(-90, 140, -60);
    scene.add(purpleLight);

    // 6. Ground Matrix Grid
    const gridHelper = new THREE.GridHelper(380, 60, 0x0284c7, 0x0f172a);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Radar Scan Disc
    const ringGeom = new THREE.RingGeometry(20, 190, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.12,
      wireframe: true
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5;
    scene.add(ring);
    threeObjectsRef.current.radarRing = ring;

    // 7. Central Gateway Hub Model
    const gatewayGroup = new THREE.Group();
    gatewayGroup.position.set(0, 0, 0);

    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(10, 14, 4, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 })
    );
    baseMesh.position.y = 2;
    gatewayGroup.add(baseMesh);

    const spireMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 7, 30, 8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.9, emissive: 0x0369a1, emissiveIntensity: 0.3 })
    );
    spireMesh.position.y = 17;
    gatewayGroup.add(spireMesh);

    const beaconMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(4),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true })
    );
    beaconMesh.position.y = 35;
    gatewayGroup.add(beaconMesh);
    threeObjectsRef.current.gatewayBeacon = beaconMesh;

    const haloMesh = new THREE.Mesh(
      new THREE.TorusGeometry(8, 0.4, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 })
    );
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.position.y = 35;
    gatewayGroup.add(haloMesh);
    threeObjectsRef.current.gatewayHalo = haloMesh;

    scene.add(gatewayGroup);

    // 8. Procedural Node Buildings and Conduits
    Object.values(nodes).forEach(node => {
      const pos = geoTo3D(node.lat, node.lon);
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(pos.x, 0, pos.z);
      nodeGroup.userData = { nodeId: node.id };

      // Specialized 3D Architectural Models
      let buildingMesh;
      if (node.modelType === 'cybertowers') {
        buildingMesh = createCyberTowers();
      } else if (node.modelType === 'skyscraper') {
        buildingMesh = createSkyscraper(12, 38, 12, 0x0284c7);
      } else if (node.modelType === 'substation') {
        buildingMesh = createSubstation();
      } else if (node.modelType === 'airport') {
        buildingMesh = createAirport();
      } else if (node.modelType === 'heritage') {
        buildingMesh = createCharminar();
      } else {
        buildingMesh = createDefaultMast();
      }
      nodeGroup.add(buildingMesh);

      // Node Status Light Beacon
      const isQuarantined = node.status === 'Quarantined';
      const beaconLight = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 16, 16),
        new THREE.MeshBasicMaterial({ color: isQuarantined ? 0xef4444 : 0x10b981 })
      );
      beaconLight.position.y = 28;
      nodeGroup.add(beaconLight);

      // Volumetric Quarantine Forcefield (Translucent Geodesic Wireframe Dome)
      const domeGeom = new THREE.SphereGeometry(16, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
        transparent: true,
        opacity: isQuarantined ? 0.6 : 0.0
      });
      const dome = new THREE.Mesh(domeGeom, domeMat);
      dome.position.y = 0;
      nodeGroup.add(dome);

      scene.add(nodeGroup);

      threeObjectsRef.current.nodes[node.id] = {
        group: nodeGroup,
        beacon: beaconLight,
        dome: dome
      };

      // 9. Laser Telemetry Conduit
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(pos.x, 15, pos.z),
        new THREE.Vector3(pos.x / 2, 45, pos.z / 2),
        new THREE.Vector3(0, 30, 0)
      );
      const points = curve.getPoints(30);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: isQuarantined ? 0xef4444 : 0x38bdf8,
        transparent: true,
        opacity: 0.5,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeom, lineMat);
      scene.add(line);

      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 8, 8),
        new THREE.MeshBasicMaterial({ color: isQuarantined ? 0xef4444 : 0x38bdf8 })
      );
      scene.add(packet);

      threeObjectsRef.current.lasers[node.id] = {
        line: line,
        curve: curve,
        packet: packet,
        progress: Math.random()
      };
    });

    // 10. Click Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
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
          onSelectNode(current.userData.nodeId);
        }
      }
    };
    container.addEventListener('click', handleClick);

    // 11. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 12. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && controls) {
        scene.rotation.y += 0.0006;
      }

      if (threeObjectsRef.current.gatewayBeacon) {
        threeObjectsRef.current.gatewayBeacon.rotation.y += 0.02;
        threeObjectsRef.current.gatewayBeacon.rotation.x += 0.01;
      }
      if (threeObjectsRef.current.gatewayHalo) {
        threeObjectsRef.current.gatewayHalo.rotation.z += 0.015;
      }

      Object.values(threeObjectsRef.current.lasers).forEach(l => {
        l.progress += 0.012;
        if (l.progress > 1.0) l.progress = 0.0;
        const pt = l.curve.getPoint(l.progress);
        l.packet.position.copy(pt);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update visual states when nodes or selection changes
  useEffect(() => {
    Object.values(nodes).forEach(node => {
      const obj = threeObjectsRef.current.nodes[node.id];
      const laser = threeObjectsRef.current.lasers[node.id];
      const isQuarantined = node.status === 'Quarantined';

      if (obj) {
        obj.beacon.material.color.setHex(isQuarantined ? 0xef4444 : 0x10b981);
        obj.dome.material.opacity = isQuarantined ? 0.65 : 0.0;
      }
      if (laser) {
        laser.line.material.color.setHex(isQuarantined ? 0xef4444 : 0x38bdf8);
        laser.packet.material.color.setHex(isQuarantined ? 0xef4444 : 0x38bdf8);
      }
    });

    // Focus camera if node selected
    if (selectedNodeId && nodes[selectedNodeId] && controlsRef.current && cameraRef.current) {
      const pos = geoTo3D(nodes[selectedNodeId].lat, nodes[selectedNodeId].lon);
      controlsRef.current.target.set(pos.x, 15, pos.z);
    }
  }, [nodes, selectedNodeId]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#05080f]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Floating 3D Instructions Badge */}
      <div className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-[#070c18]/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none flex items-center gap-2">
        <span className="text-cyan-400 font-bold">Three.js WebGL</span>
        <span>•</span>
        <span>Left Click + Drag to Orbit</span>
        <span>•</span>
        <span>Scroll to Zoom</span>
      </div>
    </div>
  );
}

// 3D Architectural Helpers
function createCyberTowers() {
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

function createSkyscraper(w, h, d, color) {
  const group = new THREE.Group();
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: color, roughness: 0.1, metalness: 0.9 })
  );
  tower.position.y = h / 2;
  group.add(tower);
  return group;
}

function createSubstation() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(16, 6, 16),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
  );
  base.position.y = 3;
  group.add(base);

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

function createAirport() {
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

function createCharminar() {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(12, 10, 12),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
  );
  base.position.y = 5;
  group.add(base);

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

function createDefaultMast() {
  const group = new THREE.Group();
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 2, 20, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })
  );
  mast.position.y = 10;
  group.add(mast);
  return group;
}
