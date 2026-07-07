# StadiumIQ — FIFA World Cup 2026 Smart Stadium AI Platform

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://fifa-stadium-ai-2026.streamlit.app/)

Developed by for the **FIFA World Cup 2026 GenAI Hackathon**.

StadiumIQ is a production-grade, AI-powered smart stadium platform that tackles real operational challenges faced by stadium organizers, staff, and fans at a 68,000-capacity live event.

---

## 🎯 Problem Statement Alignment

| Challenge | StadiumIQ Solution |
|---|---|
| **Real-time crowd safety** | Live canvas heatmap with zone-level density tracking (warning at 85%, critical at 95%), auto-generated alerts, and 8-zone simulation with realistic crowd movement patterns |
| **Multilingual fan support** | Gemini 2.0 Flash–powered AI assistant supporting 10 languages (EN/ES/FR/PT/AR/ZH/DE/HI/JA/KO) with voice input and context-aware quick replies |
| **Indoor navigation** | Interactive SVG stadium map with 18 POIs (gates, medical, food, restrooms, VIP, exits), point-to-point routing with AI-generated step-by-step directions, and wheelchair-accessible mode |
| **Incident decision support** | Structured incident reporting with AI severity analysis (LOW/MEDIUM/HIGH/CRITICAL), automated resource recommendations, ETA, and a live incident log with status tracking |
| **Scalable operations** | Real-time simulation subscriber model with pub/sub architecture enabling all four modules to react independently to the same live data stream |

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────┐
│              StadiumIQ Platform                │
│                                                │
│  config.js ──→ Central config & POI registry  │
│  simulation.js ──→ Pub/Sub live data engine    │
│       │                                        │
│       ├──→ crowd.js      (Canvas heatmap)      │
│       ├──→ decision.js   (Incident AI)         │
│       └──→ app.js        (Dashboard KPIs)      │
│                                                │
│  gemini.js ──→ Gemini 2.0 Flash API client    │
│       └──→ assistant.js  (Chat + Navigation)   │
└────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Module pattern (IIFE + closures)** — zero global namespace pollution, private state per module
- **Pub/Sub simulation** — any number of modules subscribe to live data without coupling
- **Config-driven** — all constants in `config.js` (`Object.freeze`), making it trivial to swap real IoT data for simulated data
- **Graceful degradation** — every AI feature has a full offline demo mode; no API key = no broken UI

---

## 🌟 Four Core Modules

### 1. 🔥 Crowd Intelligence
- Live **canvas-based heatmap** with per-zone density color coding (green → yellow → red)
- **Animated critical zone pulses** at ≥95% occupancy
- Zone density cards with ARIA-labelled progress bars for accessibility
- Simulated crowd movement patterns per match phase (Pre-Match → Kick-off → Half Time → Full Time)

### 2. 🗺️ Smart Navigation
- **Interactive SVG stadium map** with 18 categorized POIs
- Click-to-select origin and destination routing with animated path
- **AI-generated turn-by-turn directions** via Gemini 2.0 Flash
- **Wheelchair-accessible route filtering** (♿ mode)
- Demo fallback directions when no API key is set

### 3. 🤖 AI Assistant (Multilingual)
- **10-language support** with per-language quick reply suggestions
- **Web Speech API** voice input with visual feedback
- Context-aware conversation history (last 20 turns passed to Gemini)
- Demo response engine covering: gates, restrooms, food, schedules, lost & found, medical
- Prompt injection protection via input sanitization

### 4. ⚡ Decision Support
- Structured incident reporting with zone and type selectors
- **Gemini AI severity analysis** with immediate action plan, resource list, and ETA
- Persistent incident log with ACTIVE/RESOLVED status tracking
- Live alert feed from simulation (top 5 priority alerts)
- Resource allocation table (security, medical, fire, transport, comms, accessibility)

---

## 🔒 Security Implementation

| Layer | Implementation |
|---|---|
| **Content Security Policy** | Strict CSP header in `<meta>` — no inline scripts, only approved origins |
| **Input sanitization** | All user input stripped of HTML tags and capped at 2000 chars before Gemini API calls |
| **Output escaping** | All dynamic HTML insertion uses `_escapeHtml()` — prevents XSS from AI responses or incident data |
| **API key protection** | Key stored only in runtime memory, cleared from DOM immediately after save, never hardcoded |
| **API key validation** | Must start with `AIza` and be >20 chars before any API call is attempted |
| **Network error isolation** | All `fetch()` calls wrapped in try/catch with user-friendly error messages |

---

## ✅ Test Coverage

Tests are located in [`tests/tests.js`](tests/tests.js) and run via QUnit in the browser (`tests/index.html`).

**Test modules:**
- `Simulation Engine` — density ranges, stats shape, subscribe/unsubscribe, alert structure
- `Simulation — Edge Cases` — unknown zones, idempotent stop(), snapshot isolation
- `Configuration` — frozen CONFIG, POI schema, language schema, threshold logic
- `GeminiClient` — isReady() with valid/invalid keys, API_KEY_MISSING rejection, network errors, invalid POI handling
- `GeminiClient — Edge Cases` — key prefix validation, key length validation, INVALID_POI rejection
- `Navigation Module` — SVG rendering, accessible POI filtering
- `CrowdManager` — color mapping at all density values
- `CrowdManager — Boundary Values` — density 0, 0.5, 1.0, determinism, no empty output
- `Decision Support` — incident type population, alert count update
- `App — Security & Utilities` — `_escapeHtml()` XSS prevention, type coercion, toast rendering
- `Accessibility` — ARIA labels, aria-current, role=dialog, live regions

---

## 📂 Project Structure

```
fifa-stadium-ai-2026/
├── index.html          # Semantic SPA shell with CSP, ARIA landmarks, and all page sections
├── css/
│   └── style.css       # Design system with CSS variables, keyframe animations, responsive layout
├── js/
│   ├── config.js       # Frozen central config: API settings, zones, POIs, languages, incident types
│   ├── simulation.js   # Pub/Sub live data engine with match-phase crowd movement model
│   ├── crowd.js        # Canvas heatmap renderer with glow effects and zone cards
│   ├── navigation.js   # SVG map, POI click routing, accessibility mode, AI directions
│   ├── assistant.js    # Multilingual chatbot, voice input, quick replies, demo responses
│   ├── decision.js     # Incident form, AI analysis, incident log, resource table
│   ├── gemini.js       # Gemini 2.0 Flash API client with sanitization and error handling
│   └── app.js          # SPA router, KPI dashboard, toast system, settings, boot sequence
├── tests/
│   ├── index.html      # QUnit test runner
│   └── tests.js        # 40+ unit & integration tests across all modules
├── streamlit_app.py    # Streamlit wrapper for cloud deployment
├── requirements.txt    # Python dependencies (streamlit only)
└── README.md           # This document
```

---

## ⚡ How to Run

### Option A: Static (Zero Dependencies)
Open `index.html` directly in any modern browser (Chrome, Edge, Firefox). No build step required.

### Option B: Streamlit Cloud
```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```
Or deploy to [Streamlit Community Cloud](https://share.streamlit.io/) by linking this repository.

### Option C: Run Tests
Open `tests/index.html` in a browser to see the full QUnit test report.

---

## 🎨 Design System

- **Theme:** Premium obsidian dark (`#050a14` base, `#0a1628` cards)
- **Accent palette:** Neon cyan (`#00d4ff`), success green (`#22c55e`), warning amber (`#f0b429`), critical red (`#ef4444`)
- **Typography:** Inter (UI) + JetBrains Mono (data/code) via Google Fonts
- **Motion:** Micro-animations on all interactive elements, canvas animation at 60fps, CSS keyframe pulses for alerts
- **Responsive:** Mobile sidebar with hamburger toggle, fluid grid layout

---

## 🔑 API Key Setup

1. Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com)
2. Click **⚙️ Settings & API Key** in the sidebar
3. Paste your key — it is stored only in memory and never transmitted anywhere except the Gemini API

All four modules have full **demo mode** — the app is completely functional without an API key.
