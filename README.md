# StadiumIQ — FIFA World Cup 2026 Smart Stadium AI Platform

[![CI](https://github.com/Ritesh12911/fifa-stadium-ai-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/Ritesh12911/fifa-stadium-ai-2026/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30+-FF4B4B.svg)](https://streamlit.io)

> **Challenge 4: Smart Stadiums & Tournament Operations**  
> Build a GenAI-enabled architecture that optimizes venue operations and elevates the tournament experience for fans, organizers, volunteers, and on-ground staff.

---

## 🏟️ Overview

**StadiumIQ** is a comprehensive AI-powered web platform built for FIFA World Cup 2026. It leverages **Google Gemini 1.5 Flash** to power five integrated modules that address all core challenge tracks:

| Module | Track |
|---|---|
| 📊 Live Dashboard | Operational Intelligence |
| 🔥 Crowd Intelligence | Dynamic Crowd Management |
| 🗺️ Smart Navigation | Smart Indoor Navigation |
| 🤖 AI Assistant | Multi-Language Assistance |
| ⚡ Decision Support | Real-Time Decision Support |

---

## 🚀 Features

### 📊 Dashboard
- Live KPI metrics: fans in stadium, crowd density, active alerts, languages served
- Match schedule with live scores
- One-click access to all modules
- Animated counters that update every 3 seconds

### 🔥 Crowd Intelligence
- **Canvas-based heatmap** showing real-time zone density with green→yellow→red gradient
- 8-zone monitoring: North Stand, South Stand, East/West Wings, VIP, Media, Concourse A/B
- Auto-generated alerts when zones exceed 85% (warning) or 95% (critical)
- Pulsing animation for critical zones
- Zone-by-zone density cards with status badges

### 🗺️ Smart Indoor Navigation
- **Interactive SVG stadium map** with 18 clickable Points of Interest
- Types: Gates, Medical, Food Courts, Restrooms, VIP, Media, Info, Emergency Exits
- AI-powered step-by-step directions (Gemini API)
- **Accessibility mode** — wheelchair-friendly routes only
- Animated route path between selected POIs

### 🤖 Multilingual AI Assistant
- Powered by **Google Gemini 1.5 Flash**
- Supports **10 languages**: English, Spanish, French, Portuguese, Arabic, Chinese, German, Hindi, Japanese, Korean
- Auto-detects and responds in user's language
- **Voice input** via Web Speech API
- Quick-reply suggestions per language
- Demo mode with pre-built answers (no API key required)

### ⚡ Decision Support (Staff Hub)
- Incident reporting form with AI severity analysis
- JSON-structured AI response: severity, actions, resources, ETA
- Live alert feed updated from simulation
- Resource allocation table (security, medical, fire, transport)
- Incident log with history

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Pure HTML5, CSS3, Vanilla JS (ES6+) |
| AI Engine | Google Gemini 1.5 Flash REST API |
| Charts | Canvas 2D API (no external libs) |
| Maps | Inline SVG |
| Testing | QUnit (CDN) |
| Fonts | Google Fonts — Inter + Orbitron |
| Voice | Web Speech API |

**No build step required. Zero external dependencies for core functionality.**

---

## ⚡ Quick Start

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. The app works immediately in **Demo Mode**

### To enable full AI features:
1. Get a free Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Click **⚙️ Settings** in the sidebar
3. Paste your API key and click **Save**
4. All AI features are now active!

> ⚠️ API key is stored **in memory only** — it's never sent to any server other than Google's API endpoint.

---

## 🧪 Running Tests

Open `tests/index.html` in a browser. The QUnit test suite covers:

- ✅ Simulation Engine (density generation, alert logic, pub-sub)
- ✅ Configuration validation (POIs, thresholds, languages)
- ✅ Gemini Client (API key validation, error handling, XSS sanitization)
- ✅ Navigation Module (SVG rendering, accessibility filtering)
- ✅ Crowd Manager (color mapping, density logic)
- ✅ Decision Support (incident form, alert updating)
- ✅ Accessibility (ARIA labels, live regions, dialog roles)

---

## 📁 Project Structure

```
fifa-stadium-ai-2026/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              ← CI/CD pipeline (lint + test + security)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       ← Bug report template
│   │   └── feature_request.md  ← Feature request template
│   └── pull_request_template.md
├── css/
│   └── style.css               ← Complete design system
├── js/
│   ├── config.js               ← Configuration & constants
│   ├── gemini.js               ← Google Gemini AI client
│   ├── simulation.js           ← Live data simulation engine
│   ├── crowd.js                ← Crowd management + canvas heatmap
│   ├── navigation.js           ← Smart navigation + SVG map
│   ├── assistant.js            ← Multilingual AI chat
│   ├── decision.js             ← Decision support + incident AI
│   └── app.js                  ← SPA router + main controller
├── tests/
│   ├── index.html              ← QUnit test runner (browser)
│   ├── tests.js                ← QUnit test suite (25+ cases)
│   └── test_streamlit_app.py   ← Python unit tests (pytest)
├── index.html                  ← Main application (SPA)
├── streamlit_app.py            ← Streamlit deployment wrapper
├── pyproject.toml              ← Python project configuration
├── requirements.txt            ← Python dependencies
├── LICENSE                     ← MIT License
├── CONTRIBUTING.md             ← Contribution guidelines
├── CODE_OF_CONDUCT.md          ← Community standards
├── SECURITY.md                 ← Security disclosure policy
├── CHANGELOG.md                ← Version history
└── .editorconfig               ← Editor configuration
```

---

## 🔒 Security

- **Content Security Policy** (CSP) header prevents XSS
- User input sanitized before any AI call (HTML stripped, length capped)
- API key stored in memory only — not in localStorage or cookies
- No third-party analytics or tracking
- All external connections: Google Fonts (styles), Google AI API only

---

## ♿ Accessibility

- Full **ARIA** labeling (roles, aria-label, aria-live, aria-current)
- Keyboard navigation (Tab, Enter, Escape)
- High contrast color palette
- Screen reader support via semantic HTML5
- WCAG 2.1 AA target compliance

---

## 📊 Evaluation Criteria Coverage

| Criterion | Implementation |
|---|---|
| **Code Quality** | JSDoc comments, ES6+ modules, separation of concerns, no global pollution, `.editorconfig` |
| **Security** | CSP meta tag, input sanitization, key never stored, `SECURITY.md` policy, dependency auditing |
| **Efficiency** | Canvas RAF loop, debounced simulation, lightweight (no npm), cached Streamlit builds |
| **Testing** | 25+ JS test cases (QUnit) + Python unit tests (pytest), CI across Python 3.10–3.12 |
| **CI/CD** | GitHub Actions: linting (flake8), matrix testing, security auditing (`pip-audit`) |
| **Documentation** | Comprehensive README, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue/PR templates |
| **Accessibility** | ARIA labels, keyboard nav, live regions, semantic HTML, WCAG 2.1 AA |
| **Licensing** | MIT License with proper `LICENSE` file and `pyproject.toml` metadata |
| **Problem Alignment** | All 4 tracks: crowd, navigation, multilang, decision support |

---

## 🌍 Supported Venues (FIFA WC 2026)

- MetLife Stadium (New York/New Jersey)
- SoFi Stadium (Los Angeles)
- AT&T Stadium (Dallas)
- Levi's Stadium (San Francisco Bay Area)
- Arrowhead Stadium (Kansas City)
- Rose Bowl (Pasadena)
- Hard Rock Stadium (Miami)
- Estadio Azteca (Mexico City)
- Estadio BBVA (Monterrey)
- BC Place (Vancouver)
- BMO Field (Toronto)

---

## 👤 Author

Built for **Hack2Skill Challenge 4 — Smart Stadiums & Tournament Operations**  
Submission deadline: 19/07/2026 11:59 PM (IST)

---

*StadiumIQ — Powered by Google Gemini AI · Built for FIFA World Cup 2026*
