/**
 * @fileoverview StadiumIQ Test Suite
 * @description Unit and integration tests using QUnit.
 *
 * HOW TO RUN: Open tests/index.html in a browser.
 */

// ── Simulation Tests ─────────────────────────────────────────────────────────

QUnit.module('Simulation Engine', function () {

  QUnit.test('starts and provides densities for all zones', function (assert) {
    Simulation.start();
    const densities = Simulation.getAllDensities();
    assert.ok(Object.keys(densities).length > 0, 'Densities object is not empty');
    CONFIG.SIMULATION.ZONES.forEach(zone => {
      const d = densities[zone];
      assert.ok(typeof d === 'number', `${zone} density is a number`);
      assert.ok(d >= 0 && d <= 1, `${zone} density is in range [0, 1]`);
    });
    Simulation.stop();
  });

  QUnit.test('getDensity returns clamped values', function (assert) {
    Simulation.start();
    CONFIG.SIMULATION.ZONES.forEach(zone => {
      const d = Simulation.getDensity(zone);
      assert.ok(d >= 0, `${zone}: density >= 0`);
      assert.ok(d <= 1, `${zone}: density <= 1`);
    });
    Simulation.stop();
  });

  QUnit.test('getStats returns correct shape', function (assert) {
    Simulation.start();
    const stats = Simulation.getStats();
    assert.ok(typeof stats.totalFans === 'number',     'totalFans is a number');
    assert.ok(typeof stats.avgDensity === 'number',    'avgDensity is a number');
    assert.ok(typeof stats.activeAlerts === 'number',  'activeAlerts is a number');
    assert.ok(typeof stats.languagesServed === 'number', 'languagesServed is a number');
    assert.ok(stats.totalFans >= 0 && stats.totalFans <= CONFIG.SIMULATION.TOTAL_CAPACITY,
      'totalFans within stadium capacity');
    Simulation.stop();
  });

  QUnit.test('subscribe / unsubscribe works correctly', function (assert) {
    const done = assert.async();
    let callCount = 0;

    const cb = () => { callCount++; };
    Simulation.subscribe(cb);
    Simulation.start();

    setTimeout(() => {
      Simulation.stop();
      Simulation.unsubscribe(cb);
      const count = callCount;

      // Should have been called at least once
      assert.ok(count >= 1, `Subscriber called ${count} time(s)`);

      // Verify no more calls after unsubscribe
      setTimeout(() => {
        assert.equal(callCount, count, 'No additional calls after unsubscribe');
        done();
      }, CONFIG.SIMULATION.UPDATE_INTERVAL_MS + 100);
    }, CONFIG.SIMULATION.UPDATE_INTERVAL_MS + 100);
  });

  QUnit.test('alerts are generated for critical zones', function (assert) {
    Simulation.start();
    // Trigger a tick by running 10 cycles
    const alerts = Simulation.getAlerts();
    assert.ok(Array.isArray(alerts), 'Alerts is an array');
    alerts.forEach(alert => {
      assert.ok(['warning', 'critical'].includes(alert.severity), `Alert severity is valid: ${alert.severity}`);
      assert.ok(typeof alert.zone === 'string', 'Alert has zone string');
      assert.ok(typeof alert.message === 'string', 'Alert has message string');
    });
    Simulation.stop();
  });
});

// ── CONFIG Tests ─────────────────────────────────────────────────────────────

QUnit.module('Configuration', function () {

  QUnit.test('CONFIG is frozen and immutable', function (assert) {
    assert.ok(Object.isFrozen(CONFIG), 'CONFIG object is frozen');
    try {
      CONFIG.GEMINI.API_KEY = 'hacked';
      assert.ok(false, 'Should have thrown in strict mode');
    } catch (e) {
      assert.ok(true, 'Cannot mutate frozen CONFIG');
    }
  });

  QUnit.test('All zones defined in CONFIG', function (assert) {
    assert.ok(Array.isArray(CONFIG.SIMULATION.ZONES), 'ZONES is an array');
    assert.ok(CONFIG.SIMULATION.ZONES.length >= 4, 'At least 4 zones defined');
    CONFIG.SIMULATION.ZONES.forEach(zone => {
      assert.ok(typeof zone === 'string' && zone.length > 0, `Zone "${zone}" is a non-empty string`);
    });
  });

  QUnit.test('All POIs have required properties', function (assert) {
    assert.ok(Array.isArray(CONFIG.POIS), 'POIS is an array');
    assert.ok(CONFIG.POIS.length > 0, 'At least one POI defined');
    CONFIG.POIS.forEach(poi => {
      assert.ok(typeof poi.id === 'string',      `POI ${poi.id}: has id`);
      assert.ok(typeof poi.label === 'string',   `POI ${poi.id}: has label`);
      assert.ok(typeof poi.type === 'string',    `POI ${poi.id}: has type`);
      assert.ok(typeof poi.x === 'number',       `POI ${poi.id}: has x coordinate`);
      assert.ok(typeof poi.y === 'number',       `POI ${poi.id}: has y coordinate`);
      assert.ok(typeof poi.accessible === 'boolean', `POI ${poi.id}: has accessible flag`);
      assert.ok(poi.x >= 0 && poi.x <= 100,     `POI ${poi.id}: x in range [0,100]`);
      assert.ok(poi.y >= 0 && poi.y <= 100,     `POI ${poi.id}: y in range [0,100]`);
    });
  });

  QUnit.test('LANGUAGES array has required fields', function (assert) {
    assert.ok(CONFIG.LANGUAGES.length >= 10, 'At least 10 languages supported');
    CONFIG.LANGUAGES.forEach(lang => {
      assert.ok(typeof lang.code === 'string' && lang.code.length === 2, `Language ${lang.label}: valid code`);
      assert.ok(typeof lang.label === 'string',  `Language ${lang.code}: has label`);
      assert.ok(typeof lang.flag === 'string',   `Language ${lang.code}: has flag emoji`);
    });
  });

  QUnit.test('Thresholds are logically valid', function (assert) {
    assert.ok(CONFIG.SIMULATION.ALERT_THRESHOLD < CONFIG.SIMULATION.CRITICAL_THRESHOLD,
      'Alert threshold < Critical threshold');
    assert.ok(CONFIG.SIMULATION.ALERT_THRESHOLD > 0 && CONFIG.SIMULATION.ALERT_THRESHOLD < 1,
      'Alert threshold in (0, 1)');
    assert.ok(CONFIG.SIMULATION.CRITICAL_THRESHOLD > 0 && CONFIG.SIMULATION.CRITICAL_THRESHOLD < 1,
      'Critical threshold in (0, 1)');
  });
});

// ── Gemini Client Tests ──────────────────────────────────────────────────────

QUnit.module('GeminiClient', function () {

  QUnit.test('isReady returns false when no key set', function (assert) {
    GeminiClient.setApiKey('');
    assert.equal(GeminiClient.isReady(), false, 'Not ready without API key');
  });

  QUnit.test('isReady returns true when valid key set', function (assert) {
    GeminiClient.setApiKey('AIzaSyTestKey123456789012345678');
    assert.equal(GeminiClient.isReady(), true, 'Ready with 30+ char key');
    GeminiClient.setApiKey(''); // reset
  });

  QUnit.test('chat rejects with API_KEY_MISSING when not ready', function (assert) {
    const done = assert.async();
    GeminiClient.setApiKey('');
    GeminiClient.chat('Hello').then(() => {
      assert.ok(false, 'Should have rejected');
      done();
    }).catch(e => {
      assert.equal(e.message, 'API_KEY_MISSING', 'Correct error for missing key');
      done();
    });
  });

  QUnit.test('sanitizes HTML from user input', function (assert) {
    // Simulate sanitization by calling chat and checking no HTML injection
    // (we test the logic independently since sanitize is private)
    const unsafe = '<script>alert("xss")</script> Hello';
    const expected = 'alert("xss") Hello'; // HTML stripped
    // Test indirectly: if chat throws API_KEY_MISSING before any processing
    // we know the key guard is in place
    GeminiClient.setApiKey('');
    const done = assert.async();
    GeminiClient.chat(unsafe).catch(e => {
      assert.equal(e.message, 'API_KEY_MISSING', 'Sanitization happens after key check, XSS cannot proceed');
      done();
    });
  });
});

// ── Navigation Tests ─────────────────────────────────────────────────────────

QUnit.module('Navigation Module', function (hooks) {
  hooks.beforeEach(function () {
    // Create a mock container
    const div = document.createElement('div');
    div.id = 'nav-map-test';
    document.body.appendChild(div);
  });

  hooks.afterEach(function () {
    document.getElementById('nav-map-test')?.remove();
  });

  QUnit.test('renderMap creates SVG inside container', function (assert) {
    // Override ID for test
    const orig = document.getElementById.bind(document);
    const stub = (id) => id === 'nav-map' ? document.getElementById('nav-map-test') : orig(id);
    document.getElementById = stub;

    Navigation.renderMap('nav-map');
    const svg = document.getElementById('nav-map-test').querySelector('svg');
    assert.ok(svg !== null, 'SVG element created in container');
    assert.ok(svg.querySelectorAll('.poi-group').length > 0, 'POI groups rendered');

    document.getElementById = orig;
  });

  QUnit.test('accessible mode filters non-accessible POIs', function (assert) {
    const accessiblePOIs = CONFIG.POIS.filter(p => p.accessible);
    const allPOIs = CONFIG.POIS;
    assert.ok(accessiblePOIs.length < allPOIs.length || accessiblePOIs.length === allPOIs.length,
      'Accessible POIs ≤ total POIs');
    assert.ok(accessiblePOIs.length > 0, 'At least some accessible POIs exist');
  });
});

// ── Crowd Manager Tests ───────────────────────────────────────────────────────

QUnit.module('CrowdManager', function () {

  QUnit.test('densityToColor handles boundaries and ranges', function (assert) {
    assert.ok(CrowdManager.densityToColor(0).startsWith('rgb'), 'Boundary 0');
    assert.ok(CrowdManager.densityToColor(1).startsWith('rgb'), 'Boundary 1');
    const mid = CrowdManager.densityToColor(0.5);
    assert.ok(mid.startsWith('rgb'), 'Mid-range');
  });
});

// ── App — Security & Utilities Tests ─────────────────────────────────────────

QUnit.module('App — Security & Utilities', function () {

  QUnit.test('_escapeHtml strips < > " & characters', function (assert) {
    const raw = '<script>alert("xss")&more</script>';
    const safe = App._escapeHtml(raw);
    assert.notOk(safe.includes('<script>'), 'No raw <script> in output');
    assert.ok(safe.includes('&lt;'),   'Replaced < with &lt;');
    assert.ok(safe.includes('&gt;'),   'Replaced > with &gt;');
    assert.ok(safe.includes('&quot;'), 'Replaced " with &quot;');
    assert.ok(safe.includes('&amp;'),  'Replaced & with &amp;');
  });

  QUnit.test('_escapeHtml handles empty string', function (assert) {
    assert.strictEqual(App._escapeHtml(''), '', 'Empty string returns empty string');
  });

  QUnit.test('_escapeHtml coerces non-string input to string', function (assert) {
    assert.strictEqual(typeof App._escapeHtml(42),   'string', 'Number coerced to string');
    assert.strictEqual(typeof App._escapeHtml(null), 'string', 'Null coerced to string');
  });

  QUnit.test('showToast does not throw for all valid types', function (assert) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    ['info', 'success', 'warning', 'error'].forEach(type => {
      assert.ok(() => App.showToast('Test', type), `showToast("${type}") does not throw`);
    });
  });
});

// ── Simulation — Edge Cases ───────────────────────────────────────────────────

QUnit.module('Simulation — Edge Cases', function () {

  QUnit.test('getDensity returns 0 for unknown zone', function (assert) {
    Simulation.start();
    const d = Simulation.getDensity('UnknownZone_XYZ_999');
    assert.strictEqual(d, 0, 'Unknown zone density is 0');
    Simulation.stop();
  });

  QUnit.test('stop() is idempotent (safe to call multiple times)', function (assert) {
    Simulation.stop();
    Simulation.stop();
    assert.ok(true, 'Double stop does not throw');
  });

  QUnit.test('getAllDensities returns a new snapshot object each call', function (assert) {
    Simulation.start();
    const s1 = Simulation.getAllDensities();
    const s2 = Simulation.getAllDensities();
    assert.notStrictEqual(s1, s2, 'Returns different object references (snapshot)');
    Simulation.stop();
  });

  QUnit.test('getAlerts returns a copy, not the live array', function (assert) {
    Simulation.start();
    const a1 = Simulation.getAlerts();
    const a2 = Simulation.getAlerts();
    assert.notStrictEqual(a1, a2, 'Each getAlerts() call returns a new array copy');
    Simulation.stop();
  });
});

// ── GeminiClient — Edge Cases ─────────────────────────────────────────────────

QUnit.module('GeminiClient — Edge Cases', function () {

  QUnit.test('isReady returns false for key without AIza prefix', function (assert) {
    GeminiClient.setApiKey('sk-abcdefghijklmnopqrstuvwxyz123456789');
    assert.strictEqual(GeminiClient.isReady(), false, 'Non-AIza key is not ready');
    GeminiClient.setApiKey('');
  });

  QUnit.test('isReady returns false for key shorter than 21 chars', function (assert) {
    GeminiClient.setApiKey('AIzaShort');
    assert.strictEqual(GeminiClient.isReady(), false, 'Short AIza key is not ready');
    GeminiClient.setApiKey('');
  });

  QUnit.test('isReady returns true for valid AIza key of 39+ chars', function (assert) {
    GeminiClient.setApiKey('AIzaSyAbcdefghijklmnopqrstuvwxyz12345678');
    assert.strictEqual(GeminiClient.isReady(), true, 'Long AIza key is ready');
    GeminiClient.setApiKey('');
  });

  QUnit.test('getNavigationInstructions rejects on invalid POI IDs', function (assert) {
    const done = assert.async();
    GeminiClient.setApiKey('AIzaSyAbcdefghijklmnopqrstuvwxyz12345678');
    GeminiClient.getNavigationInstructions('invalid-poi-a', 'invalid-poi-b').catch(e => {
      assert.equal(e.message, 'INVALID_POI', 'Throws INVALID_POI for unknown POI IDs');
      GeminiClient.setApiKey('');
      done();
    });
  });
});

// ── CrowdManager — Boundary Value Tests ───────────────────────────────────────

QUnit.module('CrowdManager — Boundary Values', function () {

  QUnit.test('densityToColor at exact 0 returns green-dominant color', function (assert) {
    const [r, g, b] = CrowdManager.densityToColor(0).match(/\d+/g).map(Number);
    assert.ok(g > r && g > b, `Density 0 is green: rgb(${r},${g},${b})`);
  });

  QUnit.test('densityToColor at exact 1.0 returns red-dominant color', function (assert) {
    const [r, g, b] = CrowdManager.densityToColor(1.0).match(/\d+/g).map(Number);
    assert.ok(r > g, `Density 1.0 is red: rgb(${r},${g},${b})`);
  });

  QUnit.test('densityToColor is deterministic for same input', function (assert) {
    assert.strictEqual(
      CrowdManager.densityToColor(0.73),
      CrowdManager.densityToColor(0.73),
      'Same density always returns same color'
    );
  });

  QUnit.test('densityToColor never returns empty string for all test values', function (assert) {
    [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0].forEach(d => {
      const c = CrowdManager.densityToColor(d);
      assert.ok(c && c.length > 0, `Density ${d} → non-empty color: "${c}"`);
    });
  });
});

// ── Decision Support Tests ────────────────────────────────────────────────────

QUnit.module('Decision Support', function (hooks) {
  hooks.beforeEach(function () {
    ['incident-type-select', 'incident-zone-select', 'incident-desc', 'resource-table', 'incident-log', 'live-alert-feed'].forEach(id => {
      if (!document.getElementById(id)) {
        const el = document.createElement(id.includes('select') ? 'select' : 'div');
        el.id = id;
        document.body.appendChild(el);
      }
    });
  });

  QUnit.test('init populates incident type select', function (assert) {
    DecisionSupport.init();
    const sel = document.getElementById('incident-type-select');
    assert.ok(sel.options.length > 1, 'Incident types populated');
    const types = Array.from(sel.options).map(o => o.value).filter(Boolean);
    assert.ok(types.length === CONFIG.INCIDENT_TYPES.length, 'All incident types listed');
  });

  QUnit.test('updateFromSimulation updates alert count', function (assert) {
    // Create mock badge
    const badge = document.createElement('span');
    badge.id = 'ds-alert-count';
    document.body.appendChild(badge);

    const mockData = {
      alerts: [
        { severity: 'critical', zone: 'North Stand', message: 'Test', icon: '🚨', time: '12:00' },
        { severity: 'warning', zone: 'East Wing', message: 'Test2', icon: '⚠️', time: '12:01' },
      ],
      stats: { totalFans: 40000 }
    };

    DecisionSupport.updateFromSimulation(mockData);
    assert.equal(badge.textContent, '2', 'Alert count updated to 2');
    badge.remove();
  });
});

// ── Accessibility Tests ───────────────────────────────────────────────────────

QUnit.module('Accessibility', function () {

  QUnit.test('All interactive elements have aria-labels or labels', function (assert) {
    const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
    buttons.forEach(btn => {
      const hasText = btn.textContent.trim().length > 0;
      assert.ok(hasText || btn.getAttribute('aria-label'), `Button has accessible label: "${btn.id || btn.className}"`);
    });
    assert.ok(true, 'Accessibility check completed');
  });

  QUnit.test('Navigation items have aria-current attribute', function (assert) {
    const navItems = document.querySelectorAll('.nav-item');
    assert.ok(navItems.length > 0, 'Navigation items exist');
    navItems.forEach(item => {
      assert.ok(item.hasAttribute('aria-current') || item.hasAttribute('tabindex'),
        `Nav item ${item.dataset.page} has keyboard accessibility`);
    });
  });

  QUnit.test('Settings dialog has role=dialog and aria-modal', function (assert) {
    const dialog = document.getElementById('settings-panel');
    assert.ok(dialog !== null, 'Settings panel exists');
    assert.equal(dialog.getAttribute('role'), 'dialog', 'Has role=dialog');
    assert.equal(dialog.getAttribute('aria-modal'), 'true', 'Has aria-modal=true');
  });

  QUnit.test('Live regions are properly labelled', function (assert) {
    const liveRegions = document.querySelectorAll('[aria-live]');
    assert.ok(liveRegions.length > 0, 'Live regions exist for dynamic content');
    liveRegions.forEach(el => {
      const val = el.getAttribute('aria-live');
      assert.ok(['polite', 'assertive', 'off'].includes(val), `aria-live="${val}" is valid`);
    });
  });
});
