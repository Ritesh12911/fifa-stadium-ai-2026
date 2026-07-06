/**
 * @fileoverview Live Data Simulation Engine
 * @description Generates realistic real-time stadium data for demonstration.
 *              In production, replace with live sensor/IoT data feeds.
 */

'use strict';

const Simulation = (() => {
  /** @type {Object.<string, number>} Zone → density (0-1) */
  const _densities = {};
  /** @type {Array<Object>} Active alerts */
  const _alerts = [];
  /** @type {number|null} Interval ID */
  let _intervalId = null;
  /** @type {Set<Function>} Subscribers */
  const _listeners = new Set();

  const _matchPhase = {
    label: 'Pre-Match',
    icon: '⏱️',
    color: '#f0b429',
  };

  // Initialize with realistic pre-match densities
  function _initDensities() {
    CONFIG.SIMULATION.ZONES.forEach((zone, i) => {
      // Realistic staggered fill pattern before match
      const baseDensity = [0.45, 0.38, 0.52, 0.41, 0.88, 0.72, 0.63, 0.57][i] || 0.5;
      _densities[zone] = baseDensity + (Math.random() - 0.5) * 0.08;
    });
  }

  /**
   * Gets current density for a zone (0–1).
   * @param {string} zone
   * @returns {number}
   */
  function getDensity(zone) {
    return Math.max(0, Math.min(1, _densities[zone] || 0));
  }

  /**
   * Returns all zone densities snapshot.
   * @returns {Object}
   */
  function getAllDensities() {
    return { ..._densities };
  }

  /**
   * Returns current active alerts.
   * @returns {Array<Object>}
   */
  function getAlerts() {
    return [..._alerts];
  }

  /**
   * Returns current match phase info.
   * @returns {Object}
   */
  function getMatchPhase() {
    return { ..._matchPhase };
  }

  /**
   * Returns aggregate stadium stats.
   * @returns {Object}
   */
  function getStats() {
    const densities = Object.values(_densities);
    const avgDensity = densities.reduce((a, b) => a + b, 0) / densities.length;
    const totalFans = Math.round(avgDensity * CONFIG.SIMULATION.TOTAL_CAPACITY);
    const criticalZones = densities.filter(d => d >= CONFIG.SIMULATION.CRITICAL_THRESHOLD).length;
    const warningZones = densities.filter(d => d >= CONFIG.SIMULATION.ALERT_THRESHOLD && d < CONFIG.SIMULATION.CRITICAL_THRESHOLD).length;

    return {
      totalFans,
      avgDensity: Math.round(avgDensity * 100),
      criticalZones,
      warningZones,
      activeAlerts: _alerts.length,
      languagesServed: 7 + Math.floor(Math.random() * 4),
    };
  }

  /**
   * Subscribes a callback to data updates.
   * @param {Function} cb - Called with {densities, alerts, stats, matchPhase}
   */
  function subscribe(cb) {
    _listeners.add(cb);
  }

  function unsubscribe(cb) {
    _listeners.delete(cb);
  }

  function _notify() {
    const payload = {
      densities: getAllDensities(),
      alerts: getAlerts(),
      stats: getStats(),
      matchPhase: getMatchPhase(),
    };
    _listeners.forEach(cb => {
      try { cb(payload); } catch (e) { console.error('[Simulation] Listener error:', e); }
    });
  }

  const PHASES = ['Pre-Match', 'Kick-off', '1st Half', 'Half Time', '2nd Half', 'Full Time'];
  const PHASE_COLORS = ['#f0b429', '#22c55e', '#00d4ff', '#a855f7', '#00d4ff', '#ef4444'];
  let _phaseIdx = 0;
  let _phaseTick = 0;

  /**
   * Simulates one tick of live data.
   */
  function _tick() {
    _phaseTick++;
    if (_phaseTick % 15 === 0 && _phaseIdx < PHASES.length - 1) {
      _phaseIdx++;
      _matchPhase.label = PHASES[_phaseIdx];
      _matchPhase.color = PHASE_COLORS[_phaseIdx];
      _matchPhase.icon = ['⏱️', '⚽', '▶️', '☕', '▶️', '🏆'][_phaseIdx];
    }

    // Update densities with realistic crowd movement patterns
    CONFIG.SIMULATION.ZONES.forEach(zone => {
      let d = _densities[zone];
      const phase = _matchPhase.label;

      // Match phase affects crowd movement
      if (phase === 'Half Time') {
        // People leave stands → concourses fill up
        if (zone.includes('Concourse')) d += (Math.random() * 0.08);
        else d -= (Math.random() * 0.06);
      } else if (phase === 'Kick-off' || phase === '1st Half' || phase === '2nd Half') {
        // Stands fill, concourses empty
        if (zone.includes('Stand') || zone.includes('VIP') || zone.includes('Media')) {
          d += (Math.random() * 0.04) * (1 - d);  // fill faster when emptier
        } else {
          d -= Math.random() * 0.03;
        }
      } else if (phase === 'Full Time') {
        d -= Math.random() * 0.08;  // evacuation
      }

      // Add natural noise
      d += (Math.random() - 0.5) * 0.03;
      _densities[zone] = Math.max(0.02, Math.min(0.99, d));
    });

    // Auto-generate alerts
    _alerts.length = 0;  // clear stale alerts
    CONFIG.SIMULATION.ZONES.forEach(zone => {
      const d = _densities[zone];
      if (d >= CONFIG.SIMULATION.CRITICAL_THRESHOLD) {
        _alerts.push({
          id: `alert-${zone.replace(/\s/g, '-').toLowerCase()}`,
          zone,
          severity: 'critical',
          message: `${zone} at ${Math.round(d * 100)}% capacity — initiate controlled diversion`,
          time: new Date().toLocaleTimeString(),
          icon: '🚨',
        });
      } else if (d >= CONFIG.SIMULATION.ALERT_THRESHOLD) {
        _alerts.push({
          id: `warn-${zone.replace(/\s/g, '-').toLowerCase()}`,
          zone,
          severity: 'warning',
          message: `${zone} approaching capacity (${Math.round(d * 100)}%) — monitor closely`,
          time: new Date().toLocaleTimeString(),
          icon: '⚠️',
        });
      }
    });

    _notify();
  }

  /**
   * Starts the live simulation.
   */
  function start() {
    if (_intervalId) return;
    _initDensities();
    _notify();
    _intervalId = setInterval(_tick, CONFIG.SIMULATION.UPDATE_INTERVAL_MS);
  }

  /**
   * Stops the live simulation.
   */
  function stop() {
    if (_intervalId) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  }

  return { start, stop, subscribe, unsubscribe, getDensity, getAllDensities, getAlerts, getStats, getMatchPhase };
})();
