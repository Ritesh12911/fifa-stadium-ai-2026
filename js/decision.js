/**
 * @fileoverview Decision Support Module
 * @description AI-powered real-time incident analysis and resource management for staff.
 */

'use strict';

const DecisionSupport = (() => {
  /** @type {Array<Object>} Incident log */
  const _incidentLog = [];

  /**
   * Initializes the decision support module.
   */
  function init() {
    _renderIncidentTypes();
    _renderResourceTable();
    _seedDemoLog();
  }

  function _renderIncidentTypes() {
    const sel = document.getElementById('incident-type-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Select Incident Type --</option>' +
      CONFIG.INCIDENT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('');
  }

  function _renderResourceTable() {
    const container = document.getElementById('resource-table');
    if (!container) return;

    const resources = [
      { type: '🔒 Security Personnel', total: 320, deployed: 284, available: 36, status: 'warning' },
      { type: '🏥 Medical Staff',       total: 48,  deployed: 31,  available: 17, status: 'normal' },
      { type: '🚒 Fire Safety',         total: 24,  deployed: 24,  available: 0,  status: 'critical' },
      { type: '🚌 Shuttle Buses',       total: 60,  deployed: 45,  available: 15, status: 'normal' },
      { type: '📡 Comms Officers',      total: 80,  deployed: 72,  available: 8,  status: 'warning' },
      { type: '♿ Accessibility Aides', total: 30,  deployed: 22,  available: 8,  status: 'normal' },
    ];

    container.innerHTML = `
      <table class="resource-tbl" role="table" aria-label="Resource allocation table">
        <thead>
          <tr>
            <th scope="col">Resource</th>
            <th scope="col">Total</th>
            <th scope="col">Deployed</th>
            <th scope="col">Available</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          ${resources.map(r => `
          <tr>
            <td>${r.type}</td>
            <td>${r.total}</td>
            <td>${r.deployed}</td>
            <td>${r.available}</td>
            <td><span class="resource-status ${r.status}" aria-label="Status: ${r.status}">${r.status.toUpperCase()}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function _seedDemoLog() {
    const demos = [
      { id: 'inc-001', type: 'Crowd Surge',       zone: 'North Stand',   severity: 'warning',  time: '14:22', status: 'RESOLVED', summary: 'Controlled diversion to Gate B initiated. Density normalized within 6 min.' },
      { id: 'inc-002', type: 'Medical Emergency', zone: 'Concourse A',   severity: 'critical', time: '15:47', status: 'ACTIVE',   summary: 'Fan experiencing cardiac symptoms. Medical team dispatched. AED deployed.' },
      { id: 'inc-003', type: 'Lost Child',         zone: 'Gate D',        severity: 'normal',   time: '16:03', status: 'RESOLVED', summary: 'Child reunited with guardians at information desk within 9 minutes.' },
    ];
    _incidentLog.push(...demos);
    _renderLog();
  }

  /**
   * Submits a new incident report and gets AI analysis.
   */
  async function submitIncident() {
    const typeEl  = document.getElementById('incident-type-select');
    const zoneEl  = document.getElementById('incident-zone-select');
    const descEl  = document.getElementById('incident-desc');
    const resultEl = document.getElementById('incident-result');

    if (!typeEl || !zoneEl || !descEl || !resultEl) return;

    const type = typeEl.value;
    const zone = zoneEl.value;
    const description = descEl.value.trim();

    if (!type || !zone || !description) {
      App.showToast('Please fill in all incident fields', 'warning');
      return;
    }

    // Sanitize inputs
    const safeDesc = description.replace(/<[^>]*>/g, '').slice(0, 500);
    const density = Math.round((Simulation.getDensity(zone) || 0.5) * 100);

    resultEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>AI analyzing incident…</span></div>';

    const incidentData = { type, zone, density, description: safeDesc };

    try {
      let analysis;
      if (GeminiClient.isReady()) {
        const raw = await GeminiClient.analyzeIncident(incidentData);
        // Parse JSON safely
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { analysis = JSON.parse(jsonMatch[0]); } catch { analysis = null; }
        }
      }

      if (!analysis) {
        analysis = _getDemoAnalysis(type, density);
      }

      // Add to log
      const incidentId = `inc-${String(_incidentLog.length + 1).padStart(3, '0')}`;
      _incidentLog.unshift({
        id: incidentId,
        type,
        zone,
        severity: analysis.severity?.toLowerCase() || 'normal',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'ACTIVE',
        summary: analysis.summary || 'Under investigation',
      });
      _renderLog();

      resultEl.innerHTML = `
        <div class="analysis-card severity-${analysis.severity?.toLowerCase() || 'normal'}"
             role="region" aria-label="Incident analysis result">
          <div class="analysis-header">
            <span class="severity-badge" style="background:${analysis.color || '#f0b429'}">
              ${analysis.severity || 'MEDIUM'} SEVERITY
            </span>
            <span class="analysis-id">${incidentId}</span>
          </div>
          <p class="analysis-summary">📋 ${analysis.summary || 'Incident logged and under review.'}</p>
          <div class="analysis-section">
            <h4>⚡ Immediate Actions</h4>
            <ul>${(analysis.immediate_actions || []).map(a => `<li>${a}</li>`).join('')}</ul>
          </div>
          <div class="analysis-row">
            <div class="analysis-section">
              <h4>🚀 Resources to Deploy</h4>
              <ul>${(analysis.resources || []).map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
            <div class="analysis-section">
              <h4>⏱️ ETA</h4>
              <div class="eta-display">${analysis.eta_minutes || '?'} min</div>
            </div>
          </div>
        </div>`;

      // Clear form
      typeEl.value = '';
      zoneEl.value = '';
      descEl.value = '';

    } catch (e) {
      resultEl.innerHTML = `<div class="error-msg">⚠️ Analysis failed: ${e.message}</div>`;
    }
  }

  function _getDemoAnalysis(type, density) {
    const isCritical = density > 85 || type === 'Medical Emergency' || type === 'Fire / Smoke';
    const isHigh = density > 70 || type === 'Crowd Surge' || type === 'Security Breach';

    return {
      severity: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MEDIUM',
      color: isCritical ? '#ef4444' : isHigh ? '#f97316' : '#f0b429',
      immediate_actions: isCritical
        ? ['Dispatch emergency response team immediately', 'Activate PA system for zone announcement', 'Close entry to affected zone', 'Alert local emergency services (911)', 'Initiate medical/evacuation protocol']
        : ['Deploy 2 additional security personnel to zone', 'Monitor via CCTV for next 10 minutes', 'Brief zone coordinator via radio', 'Prepare diversion signage if needed'],
      resources: isCritical
        ? ['Emergency Response Team (6 members)', 'Medical Unit + AED', 'Security Supervisor', 'Police Liaison Officer']
        : ['2 Security Personnel', 'Zone Coordinator', 'Radio Communication Unit'],
      eta_minutes: isCritical ? 3 : 8,
      summary: `${type} in ${density}% capacity zone detected. ${isCritical ? 'IMMEDIATE action required — all available response units mobilized.' : 'Monitoring initiated with controlled response deployed.'}`,
    };
  }

  function _renderLog() {
    const el = document.getElementById('incident-log');
    if (!el) return;

    if (_incidentLog.length === 0) {
      el.innerHTML = '<p class="empty-log">No incidents logged yet.</p>';
      return;
    }

    el.innerHTML = _incidentLog.map(inc => `
      <div class="incident-row severity-${inc.severity}" role="listitem"
           aria-label="Incident ${inc.id}: ${inc.type} in ${inc.zone}, status ${inc.status}">
        <div class="incident-meta">
          <span class="inc-id">${inc.id}</span>
          <span class="inc-time">⏰ ${inc.time}</span>
          <span class="inc-badge ${inc.status.toLowerCase()}">${inc.status}</span>
        </div>
        <div class="incident-title">${inc.type} — <em>${inc.zone}</em></div>
        <div class="incident-summary">${inc.summary}</div>
      </div>`).join('');
  }

  /**
   * Updates resource deployment (called by simulation).
   */
  function updateFromSimulation(data) {
    const alertCount = document.getElementById('ds-alert-count');
    if (alertCount) alertCount.textContent = data.alerts.length;

    // Live alert feed
    const feed = document.getElementById('live-alert-feed');
    if (feed && data.alerts.length > 0) {
      feed.innerHTML = data.alerts.slice(0, 5).map(a => `
        <div class="live-alert ${a.severity}" role="alert">
          <span class="alert-icon">${a.icon}</span>
          <div class="alert-content">
            <strong>${a.zone}</strong>: ${a.message}
          </div>
          <span class="alert-time">${a.time}</span>
        </div>`).join('');
    } else if (feed) {
      feed.innerHTML = '<p class="no-alerts">✅ All zones operating normally</p>';
    }
  }

  return { init, submitIncident, updateFromSimulation };
})();
