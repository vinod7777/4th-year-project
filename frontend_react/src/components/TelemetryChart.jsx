import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

export default function TelemetryChart({ velocityHistory }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy any prior chart attached to this canvas to prevent reuse error
    const existingChart = ChartJS.getChart(canvasRef.current);
    if (existingChart) {
      existingChart.destroy();
    }
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 140);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    const chart = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: velocityHistory.map((_, i) => `${i * 2}s`),
        datasets: [{
          data: velocityHistory,
          borderColor: '#38bdf8',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#38bdf8',
          tension: 0.35,
          fill: true,
          backgroundColor: gradient
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0a0f1d',
            titleColor: '#94a3b8',
            bodyColor: '#38bdf8',
            borderColor: '#1e293b',
            borderWidth: 1,
            bodyFont: { family: 'JetBrains Mono', size: 10 },
            displayColors: false,
            callbacks: {
              label: (item) => `${item.parsed.y.toFixed(1)} pkt/s`
            }
          }
        },
        scales: {
          x: { display: false },
          y: {
            display: true,
            grid: { color: 'rgba(30, 41, 59, 0.5)' },
            ticks: {
              color: '#64748b',
              font: { family: 'JetBrains Mono', size: 9 },
              callback: (val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
            }
          }
        }
      }
    });

    chartInstanceRef.current = chart;

    return () => {
      chart.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = velocityHistory.map((_, i) => `${i * 2}s`);
      chartInstanceRef.current.data.datasets[0].data = velocityHistory;
      chartInstanceRef.current.update('none');
    }
  }, [velocityHistory]);

  const currentVal = velocityHistory[velocityHistory.length - 1] || 0;
  const peakVal = Math.max(...velocityHistory, 0);

  return (
    <div className="bg-cyber-card rounded-xl border border-slate-800/90 p-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            Packet Velocity Stream
          </h3>
        </div>
        <div className="font-mono text-xs">
          <span className="text-slate-400">CURRENT: </span>
          <span className={`font-bold ${currentVal > 500 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
            {currentVal.toFixed(1)} pkt/s
          </span>
        </div>
      </div>

      <div className="h-28 w-full relative">
        <canvas ref={canvasRef} />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80">
        <span>PEAK: <span className="text-slate-200 font-bold">{peakVal.toFixed(1)} pkt/s</span></span>
        <span>WINDOW: <span className="text-slate-200">40s (20 Pts)</span></span>
        <span>FREQ: <span className="text-emerald-400">0.5 Hz (2s)</span></span>
      </div>
    </div>
  );
}
