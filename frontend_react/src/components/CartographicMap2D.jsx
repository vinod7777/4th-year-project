import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GATEWAY_LOCATION } from '../data/municipalNodes';

export default function CartographicMap2D({ nodes, selectedNodeId, onSelectNode, onInjectThreat, onReinstate }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([17.50, 78.44], 11);
    mapInstanceRef.current = map;

    // 2. ArcGIS World Dark Gray Base Tiles (Clean, High-Res, No Watermarks)
    L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, © OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 3. Central Gateway Hub Marker
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

    const gatewayMarker = L.marker([GATEWAY_LOCATION.lat, GATEWAY_LOCATION.lon], { icon: gatewayIcon }).addTo(map);
    gatewayMarker.bindPopup(`
      <div class="p-2 font-mono">
        <div class="font-bold text-cyan-400 text-sm mb-1">${GATEWAY_LOCATION.name}</div>
        <div class="text-xs text-slate-300">${GATEWAY_LOCATION.zone}</div>
        <div class="text-[10px] text-slate-400 mt-1">Gateway Ingestion Port 5000 • EVM & 1D-CNN Core</div>
      </div>
    `);

    // 4. Initial Node Markers and Polylines
    Object.values(nodes).forEach(node => {
      const isQuarantined = node.status === 'Quarantined';
      const markerColor = isQuarantined ? '#ef4444' : '#38bdf8';
      const haloClass = isQuarantined ? 'pulsing-marker-crimson' : 'pulsing-marker-cyan';

      const icon = L.divIcon({
        className: haloClass,
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2" style="border-color: ${markerColor}; color: ${markerColor}; box-shadow: 0 0 12px ${markerColor};">
            <i class="fa-solid fa-shield-halved text-xs"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([node.lat, node.lon], { icon }).addTo(map);
      marker.on('click', () => onSelectNode(node.id));

      markersRef.current[node.id] = marker;

      // Polyline to Gateway
      const polyline = L.polyline([[node.lat, node.lon], [GATEWAY_LOCATION.lat, GATEWAY_LOCATION.lon]], {
        color: markerColor,
        weight: isQuarantined ? 3 : 2,
        opacity: 0.75,
        className: isQuarantined ? 'leaflet-quarantine-line' : ''
      }).addTo(map);

      polylinesRef.current[node.id] = polyline;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update dynamic marker styles and popups when node state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(nodes).forEach(node => {
      const isQuarantined = node.status === 'Quarantined';
      const markerColor = isQuarantined ? '#ef4444' : '#38bdf8';
      const haloClass = isQuarantined ? 'pulsing-marker-crimson' : 'pulsing-marker-cyan';

      const marker = markersRef.current[node.id];
      const polyline = polylinesRef.current[node.id];

      if (marker) {
        const icon = L.divIcon({
          className: haloClass,
          html: `
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2" style="border-color: ${markerColor}; color: ${markerColor}; box-shadow: 0 0 14px ${markerColor};">
              <i class="fa-solid ${isQuarantined ? 'fa-triangle-exclamation animate-bounce' : 'fa-shield-halved'} text-xs"></i>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        marker.setIcon(icon);

        marker.bindPopup(`
          <div class="p-2 font-mono">
            <div class="font-bold text-sm" style="color: ${markerColor}">${node.name} (${node.code})</div>
            <div class="text-xs text-slate-300 mt-1">${node.zone}</div>
            <div class="text-xs text-slate-400 mt-0.5">IP: <span class="text-cyan-400 font-bold">${node.ip}</span></div>
            <div class="text-xs text-slate-400">Rate: <span class="text-slate-200 font-bold">${node.rate.toFixed(1)} pkt/s</span> | Status: <span class="font-bold uppercase" style="color: ${markerColor}">${node.status}</span></div>
            <div class="mt-2 pt-2 border-t border-slate-700/80 flex gap-2">
              <button id="popup-attack-${node.id}" class="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 rounded text-[10px] font-bold">Inject Attack</button>
              <button id="popup-reinstate-${node.id}" class="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">Reinstate</button>
            </div>
          </div>
        `);

        // Attach popup button event listeners
        marker.on('popupopen', () => {
          const atkBtn = document.getElementById(`popup-attack-${node.id}`);
          const rstBtn = document.getElementById(`popup-reinstate-${node.id}`);
          if (atkBtn) atkBtn.onclick = () => onInjectThreat(1, node.id);
          if (rstBtn) rstBtn.onclick = () => onReinstate(node.id);
        });
      }

      if (polyline) {
        polyline.setStyle({
          color: markerColor,
          weight: isQuarantined ? 3 : 2,
          className: isQuarantined ? 'leaflet-quarantine-line' : ''
        });
      }
    });

    // Pan to selected node
    if (selectedNodeId && nodes[selectedNodeId]) {
      const target = nodes[selectedNodeId];
      map.panTo([target.lat, target.lon], { animate: true, duration: 0.8 });
    }
  }, [nodes, selectedNodeId]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full bg-[#05080f]" />
    </div>
  );
}
