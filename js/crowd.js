/**
 * @fileoverview Crowd Management Module
 * @description Canvas-based heatmap and crowd analytics for stadium zones.
 */

'use strict';

const CrowdManager = (() => {
  /** @type {HTMLCanvasElement} */
  let _canvas = null;
  /** @type {CanvasRenderingContext2D} */
  let _ctx = null;
  /** @type {number|null} */
  let _rafId = null;
  /** @type {Object} Latest simulation data */
  let _data = null;

  /**
   * Maps density (0–1) to a color (green → yellow → red).
   * @param {number} density
   * @returns {string} CSS color
   */
  function _densityToColor(density) {
    if (density < 0.5) {
      // green (#22c55e) → yellow (#f0b429)
      const t = density / 0.5;
      const r = Math.round(34 + (240 - 34) * t);
      const g = Math.round(197 + (180 - 197) * t);
      const b = Math.round(94 + (41 - 94) * t);
      return `rgb(${r},${g},${b})`;
    } else {
      // yellow → red (#ef4444)
      const t = (density - 0.5) / 0.5;
      const r = Math.round(240 + (239 - 240) * t);
      const g = Math.round(180 + (68 - 180) * t);
      const b = Math.round(41 + (68 - 41) * t);
      return `rgb(${r},${g},${b})`;
    }
  }

  /**
   * Draws the stadium heatmap on the canvas.
   */
  function _drawHeatmap() {
    if (!_canvas || !_ctx || !_data) return;
    const w = _canvas.width;
    const h = _canvas.height;
    _ctx.clearRect(0, 0, w, h);

    // Background
    _ctx.fillStyle = '#0a0e1a';
    _ctx.fillRect(0, 0, w, h);

    // Stadium oval outline
    _ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    _ctx.lineWidth = 2;
    _ctx.beginPath();
    _ctx.ellipse(w / 2, h / 2, w * 0.45, h * 0.42, 0, 0, Math.PI * 2);
    _ctx.stroke();

    // Pitch (center green)
    const pitchGrad = _ctx.createLinearGradient(w * 0.3, h * 0.35, w * 0.7, h * 0.65);
    pitchGrad.addColorStop(0, 'rgba(20, 90, 40, 0.9)');
    pitchGrad.addColorStop(0.5, 'rgba(30, 120, 55, 0.9)');
    pitchGrad.addColorStop(1, 'rgba(20, 90, 40, 0.9)');
    _ctx.fillStyle = pitchGrad;
    _ctx.beginPath();
    _ctx.ellipse(w / 2, h / 2, w * 0.22, h * 0.18, 0, 0, Math.PI * 2);
    _ctx.fill();

    // Pitch markings
    _ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.ellipse(w / 2, h / 2, w * 0.22, h * 0.18, 0, 0, Math.PI * 2);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.moveTo(w / 2, h / 2 - h * 0.18);
    _ctx.lineTo(w / 2, h / 2 + h * 0.18);
    _ctx.stroke();
    _ctx.beginPath();
    _ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
    _ctx.stroke();

    // Zone positions on the oval
    const ZONE_POSITIONS = [
      { x: 0.5, y: 0.08, w: 0.35, h: 0.12 },   // North Stand
      { x: 0.5, y: 0.92, w: 0.35, h: 0.12 },   // South Stand
      { x: 0.88, y: 0.5,  w: 0.14, h: 0.3  },   // East Wing
      { x: 0.12, y: 0.5,  w: 0.14, h: 0.3  },   // West Wing
      { x: 0.5,  y: 0.5,  w: 0.12, h: 0.08 },   // VIP Lounge (center)
      { x: 0.62, y: 0.42, w: 0.10, h: 0.06 },   // Media Box
      { x: 0.5,  y: 0.22, w: 0.28, h: 0.06 },   // Concourse A
      { x: 0.5,  y: 0.78, w: 0.28, h: 0.06 },   // Concourse B
    ];

    CONFIG.SIMULATION.ZONES.forEach((zone, i) => {
      const pos = ZONE_POSITIONS[i];
      const density = _data.densities[zone] || 0;
      const color = _densityToColor(density);
      const cx = pos.x * w;
      const cy = pos.y * h;
      const rx = pos.w * w * 0.5;
      const ry = pos.h * h * 0.5;

      // Glow effect for high-density zones
      if (density > 0.7) {
        const glow = _ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry) * 1.5);
        const alpha = (density - 0.7) / 0.3 * 0.4;
        glow.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `,${alpha})`));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        _ctx.fillStyle = glow;
        _ctx.beginPath();
        _ctx.ellipse(cx, cy, rx * 1.5, ry * 1.5, 0, 0, Math.PI * 2);
        _ctx.fill();
      }

      // Zone fill
      _ctx.globalAlpha = 0.75;
      _ctx.fillStyle = color;
      _ctx.beginPath();
      _ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      _ctx.fill();
      _ctx.globalAlpha = 1;

      // Zone border
      _ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      _ctx.lineWidth = 1;
      _ctx.beginPath();
      _ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      _ctx.stroke();

      // Density label
      _ctx.fillStyle = '#fff';
      _ctx.font = `bold ${Math.max(9, Math.min(12, rx * 0.25))}px Inter, sans-serif`;
      _ctx.textAlign = 'center';
      _ctx.textBaseline = 'middle';
      _ctx.shadowColor = 'rgba(0,0,0,0.8)';
      _ctx.shadowBlur = 4;
      _ctx.fillText(`${Math.round(density * 100)}%`, cx, cy);
      _ctx.shadowBlur = 0;

      // Zone name (small)
      _ctx.fillStyle = 'rgba(255,255,255,0.7)';
      _ctx.font = `${Math.max(7, Math.min(9, rx * 0.18))}px Inter, sans-serif`;
      _ctx.fillText(zone, cx, cy + 12);
    });

    // Alert pulse animation for critical zones
    const t = Date.now() / 500;
    CONFIG.SIMULATION.ZONES.forEach((zone, i) => {
      const density = _data.densities[zone] || 0;
      if (density >= CONFIG.SIMULATION.CRITICAL_THRESHOLD) {
        const pos = ZONE_POSITIONS[i];
        const cx = pos.x * w;
        const cy = pos.y * h;
        const r = Math.max(pos.w * w, pos.h * h) * 0.5;
        const pulse = (Math.sin(t) + 1) * 0.5;
        _ctx.strokeStyle = `rgba(239,68,68,${0.3 + pulse * 0.5})`;
        _ctx.lineWidth = 2 + pulse * 2;
        _ctx.beginPath();
        _ctx.ellipse(cx, cy, r * (1 + pulse * 0.15), r * (1 + pulse * 0.15), 0, 0, Math.PI * 2);
        _ctx.stroke();
      }
    });

    // Legend
    _drawLegend(w, h);
  }

  function _drawLegend(w, h) {
    const lx = 10, ly = h - 60, lw = 130, lh = 50;
    _ctx.fillStyle = 'rgba(10,14,26,0.8)';
    _ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.roundRect(lx, ly, lw, lh, 6);
    _ctx.fill();
    _ctx.stroke();

    const grad = _ctx.createLinearGradient(lx + 8, 0, lx + lw - 8, 0);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(0.5, '#f0b429');
    grad.addColorStop(1, '#ef4444');
    _ctx.fillStyle = grad;
    _ctx.fillRect(lx + 8, ly + 12, lw - 16, 10);

    _ctx.fillStyle = 'rgba(255,255,255,0.5)';
    _ctx.font = '8px Inter, sans-serif';
    _ctx.textAlign = 'left';
    _ctx.fillText('Low', lx + 8, ly + 36);
    _ctx.textAlign = 'center';
    _ctx.fillText('Medium', lx + lw / 2, ly + 36);
    _ctx.textAlign = 'right';
    _ctx.fillText('Critical', lx + lw - 8, ly + 36);
  }

  /**
   * Animation loop.
   */
  function _loop() {
    _drawHeatmap();
    _rafId = requestAnimationFrame(_loop);
  }

  /**
   * Initializes the crowd manager.
   * @param {string} canvasId - ID of the canvas element
   */
  function init(canvasId) {
    _canvas = document.getElementById(canvasId);
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');

    // Make canvas responsive
    function _resize() {
      const rect = _canvas.parentElement.getBoundingClientRect();
      _canvas.width = rect.width || 600;
      _canvas.height = Math.min(rect.width * 0.65, 400);
    }
    _resize();
    window.addEventListener('resize', _resize);

    // Subscribe to simulation data
    Simulation.subscribe(data => { _data = data; });

    // Start render loop
    if (_rafId) cancelAnimationFrame(_rafId);
    _loop();
  }

  /**
   * Renders zone density cards in a container.
   * @param {string} containerId
   * @param {Object} densities
   */
  function renderZoneCards(containerId, densities) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = CONFIG.SIMULATION.ZONES.map(zone => {
      const d = densities[zone] || 0;
      const pct = Math.round(d * 100);
      const color = _densityToColor(d);
      const status = d >= CONFIG.SIMULATION.CRITICAL_THRESHOLD ? 'CRITICAL'
        : d >= CONFIG.SIMULATION.ALERT_THRESHOLD ? 'WARNING' : 'NORMAL';
      const statusClass = status.toLowerCase();

      return `<div class="zone-card ${statusClass}" role="listitem" aria-label="${zone}: ${pct}% capacity, status ${status}">
        <div class="zone-header">
          <span class="zone-name">${zone}</span>
          <span class="zone-badge ${statusClass}">${status}</span>
        </div>
        <div class="zone-bar-wrap">
          <div class="zone-bar" style="width:${pct}%; background:${color}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <div class="zone-pct">${pct}%</div>
      </div>`;
    }).join('');
  }

  /**
   * Cleans up the module.
   */
  function destroy() {
    if (_rafId) cancelAnimationFrame(_rafId);
    _rafId = null;
  }

  return { init, renderZoneCards, densityToColor: _densityToColor, destroy };
})();
