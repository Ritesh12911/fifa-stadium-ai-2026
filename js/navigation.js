/**
 * @fileoverview Smart Indoor Navigation Module
 * @description SVG-based interactive stadium map with AI-powered route finding.
 */

'use strict';

const Navigation = (() => {
  /** @type {string|null} Selected "from" POI */
  let _from = null;
  /** @type {string|null} Selected "to" POI */
  let _to = null;
  /** @type {boolean} Accessibility mode active */
  let _accessibleOnly = false;

  const POI_ICONS = {
    gate:     '🚪',
    medical:  '🏥',
    food:     '🍔',
    restroom: '🚻',
    vip:      '⭐',
    media:    '📺',
    info:     'ℹ️',
    exit:     '🚨',
  };

  const POI_COLORS = {
    gate:     '#00d4ff',
    medical:  '#ef4444',
    food:     '#f0b429',
    restroom: '#a855f7',
    vip:      '#ffd700',
    media:    '#6366f1',
    info:     '#22c55e',
    exit:     '#ff6b35',
  };

  /**
   * Renders the interactive SVG stadium map.
   * @param {string} containerId
   */
  function renderMap(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const filteredPOIs = _accessibleOnly
      ? CONFIG.POIS.filter(p => p.accessible)
      : CONFIG.POIS;

    const svgPOIs = filteredPOIs.map(poi => {
      const cx = poi.x * 4;  // scale: 100% → 400px
      const cy = poi.y * 3;  // scale: 100% → 300px
      const color = POI_COLORS[poi.type] || '#fff';
      const icon = POI_ICONS[poi.type] || '📍';
      const isFrom = poi.id === _from;
      const isTo = poi.id === _to;
      const ring = isFrom || isTo
        ? `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${isFrom ? '#00d4ff' : '#22c55e'}" stroke-width="2" stroke-dasharray="4 2" class="poi-ring"/>`
        : '';

      return `<g class="poi-group" data-id="${poi.id}" role="button" tabindex="0"
                aria-label="${poi.label}${!poi.accessible ? ' (not wheelchair accessible)' : ''}"
                title="${poi.label}">
        ${ring}
        <circle cx="${cx}" cy="${cy}" r="10" fill="${color}" fill-opacity="0.85"
          class="poi-dot ${isFrom ? 'poi-from' : ''} ${isTo ? 'poi-to' : ''}"/>
        <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
          font-size="9" class="poi-icon">${icon}</text>
        ${!poi.accessible ? `<text x="${cx+8}" y="${cy-8}" font-size="9">♿̈</text>` : ''}
      </g>`;
    }).join('');

    // Route line between from → to
    let routeLine = '';
    if (_from && _to) {
      const fromPOI = CONFIG.POIS.find(p => p.id === _from);
      const toPOI = CONFIG.POIS.find(p => p.id === _to);
      if (fromPOI && toPOI) {
        const x1 = fromPOI.x * 4, y1 = fromPOI.y * 3;
        const x2 = toPOI.x * 4, y2 = toPOI.y * 3;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 - 20; // slight arc
        routeLine = `
          <path d="M${x1},${y1} Q${midX},${midY} ${x2},${y2}"
            fill="none" stroke="#00d4ff" stroke-width="2.5"
            stroke-dasharray="6 3" class="route-path" opacity="0.9"/>
          <circle cx="${x1}" cy="${y1}" r="5" fill="#00d4ff"/>
          <circle cx="${x2}" cy="${y2}" r="5" fill="#22c55e"/>`;
      }
    }

    el.innerHTML = `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"
           role="img" aria-label="Interactive Stadium Map"
           style="width:100%;height:100%;cursor:default">
        <defs>
          <style>
            .poi-group { cursor:pointer; transition: transform 0.15s; }
            .poi-group:hover, .poi-group:focus { outline:none; transform-origin: center; }
            .poi-ring { animation: spin 3s linear infinite; transform-origin: center; }
            .route-path { animation: dash 1s linear infinite; }
            @keyframes dash { to { stroke-dashoffset: -18; } }
            @keyframes spin { to { stroke-dashoffset: -18; } }
          </style>
          <!-- Glow filter -->
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Outer Stadium -->
        <ellipse cx="200" cy="150" rx="185" ry="138" fill="#0d1424" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>

        <!-- Stand layers -->
        <ellipse cx="200" cy="150" rx="170" ry="124" fill="#111827" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        <ellipse cx="200" cy="150" rx="100" ry="72" fill="#0f2010" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>

        <!-- Pitch -->
        <ellipse cx="200" cy="150" rx="88" ry="62" fill="#166534"/>
        <!-- Pitch lines -->
        <ellipse cx="200" cy="150" rx="88" ry="62" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <line x1="200" y1="88" x2="200" y2="212" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <circle cx="200" cy="150" r="18" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
        <circle cx="200" cy="150" r="2" fill="rgba(255,255,255,0.5)"/>
        <!-- Goal areas -->
        <rect x="113" y="135" width="22" height="30" rx="2" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
        <rect x="265" y="135" width="22" height="30" rx="2" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>

        <!-- Walkways -->
        <ellipse cx="200" cy="150" rx="130" ry="93" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="8"/>

        <!-- Zone labels -->
        <text x="200" y="24" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="9" font-family="Inter">NORTH STAND</text>
        <text x="200" y="285" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="9" font-family="Inter">SOUTH STAND</text>
        <text x="10" y="152" fill="rgba(255,255,255,0.3)" font-size="9" font-family="Inter" writing-mode="vertical-lr">WEST WING</text>
        <text x="385" y="152" fill="rgba(255,255,255,0.3)" font-size="9" font-family="Inter" writing-mode="vertical-lr">EAST WING</text>

        <!-- Route -->
        ${routeLine}

        <!-- POIs -->
        <g filter="url(#glow)">
          ${svgPOIs}
        </g>
      </svg>`;

    // Attach click handlers
    el.querySelectorAll('.poi-group').forEach(g => {
      const handler = () => _handlePoiClick(g.dataset.id);
      g.addEventListener('click', handler);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
    });
  }

  /**
   * Handles POI selection (from/to routing).
   * @param {string} id
   */
  function _handlePoiClick(id) {
    if (!_from) {
      _from = id;
    } else if (!_to && id !== _from) {
      _to = id;
    } else {
      _from = id;
      _to = null;
    }

    // Re-render map
    renderMap('nav-map');

    // Update selector UI
    _updateSelectors();

    // Show get directions button if both selected
    const btn = document.getElementById('get-directions-btn');
    if (btn) btn.style.display = _from && _to ? 'flex' : 'none';
  }

  function _updateSelectors() {
    const fromEl = document.getElementById('nav-from-label');
    const toEl = document.getElementById('nav-to-label');
    if (fromEl) fromEl.textContent = _from ? (CONFIG.POIS.find(p => p.id === _from)?.label || '') : 'Tap a POI on the map';
    if (toEl) toEl.textContent = _to ? (CONFIG.POIS.find(p => p.id === _to)?.label || '') : 'Tap another POI';
  }

  /**
   * Toggles accessibility-only mode.
   * @param {boolean} enabled
   */
  /**
   * Toggles accessibility-only mode and invalidates any non-accessible
   * route selections that would become unreachable.
   * @param {boolean} enabled
   */
  function setAccessibleMode(enabled) {
    _accessibleOnly = enabled;
    if (enabled) {
      const fromPOI = _from ? CONFIG.POIS.find(p => p.id === _from) : null;
      const toPOI   = _to   ? CONFIG.POIS.find(p => p.id === _to)   : null;
      if (fromPOI && !fromPOI.accessible) { _from = null; _to = null; }
      else if (toPOI && !toPOI.accessible) { _to = null; }
    }
    renderMap('nav-map');
    _updateSelectors();
  }

  /**
   * Clears the current route selection.
   */
  function clearRoute() {
    _from = null;
    _to = null;
    renderMap('nav-map');
    _updateSelectors();
    const btn = document.getElementById('get-directions-btn');
    if (btn) btn.style.display = 'none';
    const directions = document.getElementById('nav-directions');
    if (directions) directions.innerHTML = '';
  }

  /**
   * Requests AI-powered directions between selected POIs.
   */
  async function getDirections() {
    if (!_from || !_to) return;
    const el = document.getElementById('nav-directions');
    if (!el) return;

    el.innerHTML = `<div class="loading-spinner" aria-label="Getting directions">
      <div class="spinner"></div><span>AI is calculating your route…</span>
    </div>`;

    try {
      const result = await GeminiClient.getNavigationInstructions(_from, _to, _accessibleOnly);
      el.innerHTML = `<div class="directions-result" role="region" aria-label="Navigation instructions">
        <div class="directions-header">
          <span class="dir-icon">🗺️</span>
          <span>AI-Generated Directions</span>
          ${_accessibleOnly ? '<span class="badge-access">♿ Accessible</span>' : ''}
        </div>
        <div class="directions-steps">${_formatDirections(result)}</div>
      </div>`;
    } catch (e) {
      if (e.message === 'API_KEY_MISSING') {
        el.innerHTML = `<div class="nav-demo-directions">
          <div class="directions-header"><span class="dir-icon">🗺️</span><span>Sample Directions (Demo Mode)</span></div>
          <div class="directions-steps">${_getDemoDirections()}</div>
          <p class="demo-note">💡 Add your Gemini API key in Settings for AI-powered directions.</p>
        </div>`;
      } else {
        el.innerHTML = `<div class="error-msg">⚠️ Could not get directions: ${e.message}</div>`;
      }
    }
  }

  function _formatDirections(text) {
    return text
      .split('\n')
      .filter(l => l.trim())
      .map((line, i) => {
        const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
        return `<div class="direction-step">
          <span class="step-num">${i + 1}</span>
          <span class="step-text">${cleaned}</span>
        </div>`;
      }).join('');
  }

  function _getDemoDirections() {
    const fromPOI = CONFIG.POIS.find(p => p.id === _from);
    const toPOI = CONFIG.POIS.find(p => p.id === _to);
    const steps = [
      `Exit ${fromPOI?.label || 'current location'} and head toward the main concourse`,
      'Follow the green wayfinding signs along the inner ring',
      'Take the next available stairway or elevator (if accessible mode)',
      'Continue straight for approximately 200 meters',
      `Arrive at ${toPOI?.label || 'your destination'} on your left`,
    ];
    return steps.map((s, i) => `<div class="direction-step">
      <span class="step-num">${i + 1}</span>
      <span class="step-text">${s}</span>
    </div>`).join('');
  }

  return { renderMap, setAccessibleMode, clearRoute, getDirections };
})();
