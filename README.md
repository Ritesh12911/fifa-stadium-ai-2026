# StadiumIQ — FIFA World Cup 2026 Smart Stadium AI Platform

[![CI/CD - GitHub Pages](https://github.com/Ritesh12911/fifa-stadium-ai-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/Ritesh12911/fifa-stadium-ai-2026/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Web](https://img.shields.io/badge/Platform-Static%20Web-blue.svg)](https://github.com/Ritesh12911/fifa-stadium-ai-2026)
[![Deployment: GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-orange.svg)](https://ritesh12911.github.io/fifa-stadium-ai-2026)

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

## ⚡ Quick Start & Deployment

### Run Locally
1. Clone or download this repository:
   ```bash
   git clone https://github.com/Ritesh12911/fifa-stadium-ai-2026.git
   ```
2. Open `index.html` in any modern web browser.
3. The app works immediately in **Demo Mode**.

### Deploy on GitHub Pages
This repository is configured with a GitHub Actions workflow to automatically deploy to GitHub Pages on every push to the `main` branch:

1. In your GitHub repository, go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions** (or select **Deploy from a branch** and choose `main` branch / root folder).
3. Push changes to `main` branch. GitHub Actions will build, test, and host the app at:
   `https://ritesh12911.github.io/fifa-stadium-ai-2026/`

### To enable full AI features:
1. Get a free Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Click **⚙️ Settings** in the sidebar of the deployed web application
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
│   │   └── ci.yml              ← CI/CD pipeline (Lint, QUnit + Build & Deploy)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── css/
│   └── style.css               ← Complete design system stylesheet
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
│   └── tests.js                ← QUnit test suite (25+ cases)
├── index.html                  ← Main application source code (SPA)
├── build.js                    ← Node.js static assets compiler & minifier
├── package.json                ← JavaScript project metadata & build scripts
├── eslint.config.js            ← ESLint code quality flat configuration
├── manifest.json               ← PWA application manifest
├── sw.js                       ← PWA Service Worker caching module
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

## 🎯 Problem Statement Alignment

StadiumIQ is directly aligned with **Challenge 4: Smart Stadiums & Tournament Operations** for the **FIFA World Cup 2026**. The platform addresses venue operations and tournament experience optimization for all key stakeholders:

- **For Fans**: Elevates the tournament experience through **Smart Indoor Navigation** (supporting accessibility/wheelchair-friendly routes) and the **Multilingual AI Assistant** (supporting 10 languages and voice input via Web Speech API) to easily find gate locations, medical centers, food courts, and restrooms.
- **For Organizers & Staff**: Optimizes venue operations through the **Live Dashboard** (live KPIs, schedules, scores) and **Crowd Intelligence** module (real-time Canvas-based zone density heatmaps with automated alert triggers).
- **For On-Ground Staff & Volunteers**: Real-time **Decision Support (Staff Hub)** allowing incident reporting, resource allocation tracking, and automated GenAI severity/action analysis powered by Google Gemini 1.5 Flash.
- **For Venue Operators**: Zero-latency simulation and robust client-side architecture that minimizes infrastructure overhead.

---

## 📊 Evaluation Criteria Coverage

| Criterion | Implementation |
|---|---|
| **Code Quality** | Linted JavaScript (`eslint.config.js` with 0 warnings/errors), type-annotated JSDoc, and `.editorconfig`. |
| **Security** | Sandboxed CSP meta tag framing, input sanitization against prompt injection, secure key runtime storage, and `SECURITY.md`. |
| **Efficiency** | Canvas RAF paint cycles, PWA offline asset caching via Service Worker, CDN warming, and build minification. |
| **Testing** | 25+ JS QUnit tests running headlessly in Puppeteer. |
| **CI/CD** | GitHub Actions pipeline executing ESLint checks, headless QUnit tests, and Pages deployment. |
| **Documentation** | Comprehensive README, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and templates. |
| **Accessibility** | ARIA labeling, keyboard navigation focus rings, live status regions, and high contrast WCAG 2.1 AA compliance. |
| **Licensing** | MIT License with proper `LICENSE` file. |
| **Problem Alignment** | Direct optimization of FIFA 2026 venue operations and elevation of user experiences across fans, staff, and organizers. |

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
