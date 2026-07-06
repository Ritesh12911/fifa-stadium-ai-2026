/**
 * @fileoverview StadiumIQ Configuration
 * @description Central config for API keys, constants, and feature flags.
 * @version 1.0.0
 */

'use strict';

const CONFIG = Object.freeze({
  /** Gemini AI Settings */
  GEMINI: {
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    API_KEY: '',          // Set via UI settings panel — never hardcode in production
    MAX_TOKENS: 512,
    TEMPERATURE: 0.7,
    SYSTEM_CONTEXT: `You are StadiumIQ, an intelligent AI assistant deployed at FIFA World Cup 2026 stadiums in the USA, Canada, and Mexico. You help fans, staff, volunteers, and organizers with:
- Navigation inside stadiums (gates, restrooms, food courts, medical, exits)
- Match schedules, team info, and tournament updates
- Stadium policies, security rules, and accessibility services
- Emergency procedures and crowd safety
- Real-time crowd management insights for staff
- Translations and multilingual support
Always respond in the SAME LANGUAGE the user writes in. Be concise, helpful, and safety-conscious. For staff queries about crowd management, provide actionable recommendations.`
  },

  /** Stadium Simulation */
  SIMULATION: {
    UPDATE_INTERVAL_MS: 3000,        // How often live data refreshes
    ZONES: ['North Stand', 'South Stand', 'East Wing', 'West Wing', 'VIP Lounge', 'Media Box', 'Concourse A', 'Concourse B'],
    MAX_ZONE_CAPACITY: 8000,
    ALERT_THRESHOLD: 0.85,           // 85% = warning
    CRITICAL_THRESHOLD: 0.95,        // 95% = critical
    TOTAL_CAPACITY: 68000,
  },

  /** UI / Feature Flags */
  UI: {
    ANIMATION_DURATION_MS: 400,
    TOAST_DURATION_MS: 4000,
    CHART_FPS: 30,
  },

  /** Supported Languages */
  LANGUAGES: [
    { code: 'en', label: 'English',    flag: '🇺🇸' },
    { code: 'es', label: 'Español',    flag: '🇲🇽' },
    { code: 'fr', label: 'Français',   flag: '🇫🇷' },
    { code: 'pt', label: 'Português',  flag: '🇧🇷' },
    { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
    { code: 'zh', label: '中文',       flag: '🇨🇳' },
    { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
    { code: 'hi', label: 'हिंदी',     flag: '🇮🇳' },
    { code: 'ja', label: '日本語',     flag: '🇯🇵' },
    { code: 'ko', label: '한국어',     flag: '🇰🇷' },
  ],

  /** Stadium POIs for Navigation */
  POIS: [
    { id: 'gate-a', label: 'Gate A (Main Entrance)', type: 'gate', x: 50, y: 10, accessible: true },
    { id: 'gate-b', label: 'Gate B (East)', type: 'gate', x: 90, y: 50, accessible: true },
    { id: 'gate-c', label: 'Gate C (West)', type: 'gate', x: 10, y: 50, accessible: true },
    { id: 'gate-d', label: 'Gate D (South)', type: 'gate', x: 50, y: 90, accessible: true },
    { id: 'medical-1', label: 'Medical Center 1', type: 'medical', x: 30, y: 25, accessible: true },
    { id: 'medical-2', label: 'Medical Center 2', type: 'medical', x: 70, y: 75, accessible: true },
    { id: 'food-1', label: 'Food Court A', type: 'food', x: 20, y: 50, accessible: true },
    { id: 'food-2', label: 'Food Court B', type: 'food', x: 80, y: 50, accessible: true },
    { id: 'food-3', label: 'Food Court C', type: 'food', x: 50, y: 30, accessible: false },
    { id: 'restroom-1', label: 'Restrooms North', type: 'restroom', x: 50, y: 20, accessible: true },
    { id: 'restroom-2', label: 'Restrooms South', type: 'restroom', x: 50, y: 80, accessible: true },
    { id: 'restroom-3', label: 'Restrooms East', type: 'restroom', x: 80, y: 40, accessible: true },
    { id: 'restroom-4', label: 'Restrooms West', type: 'restroom', x: 20, y: 60, accessible: true },
    { id: 'vip', label: 'VIP Lounge', type: 'vip', x: 50, y: 50, accessible: true },
    { id: 'media', label: 'Media Box', type: 'media', x: 60, y: 45, accessible: false },
    { id: 'info', label: 'Info Desk', type: 'info', x: 50, y: 15, accessible: true },
    { id: 'exit-e', label: 'Emergency Exit', type: 'exit', x: 35, y: 85, accessible: true },
    { id: 'exit-f', label: 'Emergency Exit', type: 'exit', x: 65, y: 85, accessible: true },
  ],

  /** Incident Types for Decision Support */
  INCIDENT_TYPES: [
    'Crowd Surge',
    'Medical Emergency',
    'Structural Concern',
    'Security Breach',
    'Fire / Smoke',
    'Power Outage',
    'Lost Child / Person',
    'Technical Failure',
    'Weather Emergency',
    'Other',
  ],
});
