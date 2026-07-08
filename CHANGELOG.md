# Changelog

All notable changes to StadiumIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.0] - 2026-07-08

### Changed
- Migrated deployment target from Streamlit hosting to static GitHub Pages.
- Refactored `.github/workflows/ci.yml` to automatically test and deploy to GitHub Pages.
- Updated README with static deployment documentation, badges, and structure.

### Removed
- Deleted `streamlit_app.py` Streamlit entry point.
- Deleted Python-specific files (`requirements.txt`, `pyproject.toml`).
- Deleted Python unit tests (`tests/test_streamlit_app.py`).

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
