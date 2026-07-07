/**
 * @fileoverview Main Application Controller
 * @description SPA router, dashboard, settings, and global utility functions.
 */

'use strict';

const App = (() => {
  /** @type {string} Current page */
  let _currentPage = 'dashboard';
  /** @type {boolean} Settings panel open */
  let _settingsOpen = false;

  // ── Dashboard KPI counters ──────────────────────────────────────────────────

  /**
   * Animates a counter from 0 to target value.
   * @param {string} id - Element ID
   * @param {number} target
   * @param {string} [suffix='']
   * @param {number} [duration=1200]
   */
  function _animateCounter(id, target, suffix = '', duration = 1200) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = performance.now();
    const from = parseInt(el.textContent) || 0;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(from + (target - from) * ease) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /**
   * Updates the dashboard KPI cards.
   * @param {Object} stats
   * @param {Object} matchPhase
   */
  function _updateDashboard(stats, matchPhase) {
    _animateCounter('kpi-fans',      stats.totalFans,      '', 800);
    _animateCounter('kpi-density',   stats.avgDensity,     '%', 800);
    _animateCounter('kpi-alerts',    stats.activeAlerts,   '', 600);
    _animateCounter('kpi-languages', stats.languagesServed, '', 600);

    const phaseEl = document.getElementById('match-phase-label');
    if (phaseEl) {
      phaseEl.textContent = `${matchPhase.icon} ${matchPhase.label}`;
      phaseEl.style.color = matchPhase.color;
    }

    // Warning badges on KPI cards
    const alertCard = document.getElementById('kpi-alerts-card');
    if (alertCard) {
      alertCard.className = `kpi-card ${stats.activeAlerts > 0 ? (stats.activeAlerts > 3 ? 'card-critical' : 'card-warning') : ''}`;
    }
  }

  // ── Navigation / Routing ────────────────────────────────────────────────────

  /**
   * Navigates to a page.
   * @param {string} pageId
   */
  function navigate(pageId) {
    if (_currentPage === pageId) return;

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });

    // Show target page
    const page = document.getElementById(`page-${pageId}`);
    if (page) {
      page.classList.add('active');
      page.setAttribute('aria-hidden', 'false');
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.page === pageId);
      n.setAttribute('aria-current', n.dataset.page === pageId ? 'page' : 'false');
    });

    // Close sidebar on mobile
    closeSidebar();

    const prevPage = _currentPage;
    _currentPage = pageId;

    // Page-specific init on first visit
    switch (pageId) {
      case 'crowd':
        CrowdManager.init('heatmap-canvas');
        break;
      case 'navigation':
        Navigation.renderMap('nav-map');
        break;
      case 'assistant':
        Assistant.init();
        Assistant.renderLanguageSelector('lang-selector');
        break;
      case 'decision':
        DecisionSupport.init();
        break;
    }
  }

  // ── Sidebar ─────────────────────────────────────────────────────────────────

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isOpen = sidebar?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('active');
    const btn = document.getElementById('hamburger-btn');
    if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('active');
    const btn = document.getElementById('hamburger-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  // ── Settings Panel ──────────────────────────────────────────────────────────

  function toggleSettings() {
    _settingsOpen = !_settingsOpen;
    const panel = document.getElementById('settings-panel');
    if (panel) {
      panel.classList.toggle('open', _settingsOpen);
      panel.setAttribute('aria-hidden', !_settingsOpen);
    }
  }

  function saveSettings() {
    const keyEl = document.getElementById('api-key-input');
    if (keyEl && keyEl.value.trim()) {
      GeminiClient.setApiKey(keyEl.value.trim());
      keyEl.value = ''; // clear from DOM for security
      showToast('✅ Gemini API key saved!', 'success');
    } else {
      showToast('Please enter a valid API key', 'warning');
    }
    toggleSettings();
  }

  // ── Toast Notifications ─────────────────────────────────────────────────────

  /**
   * Shows a toast notification.
   * @param {string} message
   * @param {'success'|'warning'|'error'|'info'} [type='info']
   */
  /**
   * Escapes a string for safe insertion as text content.
   * @param {string} str
   * @returns {string}
   */
  function _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const id = `toast-${Date.now()}`;
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const safeMsg = _escapeHtml(message);
    container.insertAdjacentHTML('beforeend', `
      <div id="${id}" class="toast toast-${type}" role="alert" aria-live="polite">
        <span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ️'}</span>
        <span class="toast-msg">${safeMsg}</span>
      </div>`);

    // Auto remove
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('fade-out'); setTimeout(() => el.remove(), 300); }
    }, CONFIG.UI.TOAST_DURATION_MS);
  }

  // ── Match Schedule (Dashboard) ──────────────────────────────────────────────

  function _renderSchedule() {
    const el = document.getElementById('match-schedule');
    if (!el) return;
    const matches = [
      { time: '15:00', home: '🇧🇷 Brazil', away: '🇩🇪 Germany',    group: 'A', venue: 'MetLife', score: '2–1' },
      { time: '18:00', home: '🇫🇷 France', away: '🇦🇷 Argentina', group: 'B', venue: 'SoFi',    score: 'LIVE' },
      { time: '21:00', home: '🇪🇸 Spain',  away: '🇵🇹 Portugal',  group: 'C', venue: 'AT&T',    score: 'TBD' },
    ];
    el.innerHTML = matches.map(m => `
      <div class="schedule-row" role="listitem">
        <div class="match-time">${m.time}</div>
        <div class="match-teams">
          <span class="team">${m.home}</span>
          <span class="match-score ${m.score === 'LIVE' ? 'score-live' : ''}">${m.score}</span>
          <span class="team">${m.away}</span>
        </div>
        <div class="match-meta">Group ${m.group} · ${m.venue}</div>
      </div>`).join('');
  }

  // ── Boot ────────────────────────────────────────────────────────────────────

  /**
   * Bootstraps the application.
   */
  function boot() {
    // Attach nav listeners
    document.querySelectorAll('.nav-item').forEach(n => {
      n.addEventListener('click', () => navigate(n.dataset.page));
      n.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(n.dataset.page); });
    });

    // Sidebar overlay click
    document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

    // Keyboard: Escape closes panels
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeSidebar();
        if (_settingsOpen) toggleSettings();
      }
    });

    // Chat input enter key
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); Assistant.sendMessage(); }
      });
    }

    // Start simulation
    Simulation.start();

    // Subscribe dashboard to simulation
    Simulation.subscribe(({ stats, matchPhase, alerts }) => {
      if (_currentPage === 'dashboard') _updateDashboard(stats, matchPhase);
      if (_currentPage === 'crowd') {
        CrowdManager.renderZoneCards('zone-cards', Simulation.getAllDensities());
      }
      if (_currentPage === 'decision') {
        DecisionSupport.updateFromSimulation({ alerts, stats });
      }
    });

    // Render static content
    _renderSchedule();

    // Show dashboard first
    navigate('dashboard');

    console.log('[StadiumIQ] App initialized ✅');
  }

  return { boot, navigate, toggleSidebar, closeSidebar, toggleSettings, saveSettings, showToast, _escapeHtml };
})();

// Boot when DOM is ready
document.addEventListener('DOMContentLoaded', App.boot);
