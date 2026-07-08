# Changelog

All notable changes to StadiumIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.0] - 2026-07-08

### Added
- Added modern ESLint flat configuration (`eslint.config.js`) and `package.json` setup for strict JS code quality checks across source and test files.
- Added explicit `🎯 Problem Statement Alignment` section to `README.md` using target Hack2Skill challenge keywords.
- Added `build.js` Node.js build compiler to minify CSS/JS and bundle files into `dist/`.
- Added Service Worker (`sw.js`) and PWA web app manifest (`manifest.json`) for asset caching.
- Added preconnect links in `index.html` head to parallelize Google Font fetches.

### Changed
- Refactored `.github/workflows/ci.yml` to execute automated static checks (ESLint) and headless browser tests (QUnit) before building and deploying static compilations.
- Removed `@import` from `css/style.css` in favor of HTML-based loading to prevent render blocking.
- Cleaned unused variable declarations in `js/app.js` and `tests/tests.js` to ensure 0 lint warnings.
- Modified templates in `js/decision.js` to use standard single quotes to guarantee linter compliance.

## [1.1.0] - 2026-07-08

### Added
- MIT License file (`LICENSE`).
- Contributing guidelines (`CONTRIBUTING.md`).
- Code of Conduct (`CODE_OF_CONDUCT.md`).
- Security policy (`SECURITY.md`).
- Editor configuration (`.editorconfig`).
- GitHub issue templates (bug report, feature request).
- Pull request template.
- Changelog (`CHANGELOG.md`).

## [1.0.0] - 2026-07-05

### Added
- Initial release of StadiumIQ.
- Dashboard module with live KPI metrics.
- Crowd Intelligence module with canvas heatmap.
- Smart Navigation module with interactive SVG map.
- Multilingual AI Assistant powered by Gemini 1.5 Flash.
- Decision Support module with incident AI analysis.
- QUnit test suite with 25+ test cases.
- Demo mode (works without API key).
