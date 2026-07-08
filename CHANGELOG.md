# Changelog

All notable changes to StadiumIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-07-08

### Added
- MIT License file (`LICENSE`)
- CI/CD pipeline with GitHub Actions (`ci.yml`)
  - Python linting with flake8
  - Matrix testing across Python 3.10, 3.11, 3.12
  - Security auditing with pip-audit
  - QUnit headless browser tests
- Python unit tests (`tests/test_streamlit_app.py`)
  - Asset inlining validation
  - CSP meta tag preservation
  - CSS/JS inline verification
- Project configuration (`pyproject.toml`)
- Contributing guidelines (`CONTRIBUTING.md`)
- Code of Conduct (`CODE_OF_CONDUCT.md`)
- Security policy (`SECURITY.md`)
- Editor configuration (`.editorconfig`)
- GitHub issue templates (bug report, feature request)
- Pull request template
- Changelog (`CHANGELOG.md`)
- README badges (CI status, license, Python version, Streamlit)

### Changed
- `streamlit_app.py`: Rebuild CSP for iframe delivery instead of stripping it entirely
- `streamlit_app.py`: Added structured logging for missing assets
- Updated README with expanded project structure and evaluation criteria
- Enhanced documentation coverage

### Security
- CSP meta tag is now properly rebuilt for Streamlit iframe context
- Added `SECURITY.md` with responsible disclosure policy
- CI pipeline includes dependency security auditing

## [1.0.0] - 2026-07-05

### Added
- Initial release of StadiumIQ
- Dashboard module with live KPI metrics
- Crowd Intelligence module with canvas heatmap
- Smart Navigation module with interactive SVG map
- Multilingual AI Assistant powered by Gemini 1.5 Flash
- Decision Support module with incident AI analysis
- QUnit test suite with 25+ test cases
- Streamlit deployment wrapper
- Demo mode (works without API key)
