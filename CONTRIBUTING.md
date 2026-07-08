# Contributing to StadiumIQ

Thank you for considering contributing to **StadiumIQ — FIFA World Cup 2026 Smart Stadium Platform**!

## How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](../../issues)
2. Open a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS info

### Suggesting Features
1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Include mockups or examples if possible

### Submitting Code
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following the code style guidelines below
4. Add tests for any new functionality
5. Ensure all tests pass: open `tests/index.html` in a browser
6. Commit with descriptive messages: `git commit -m "Add: feature description"`
7. Push and open a Pull Request

## Code Style Guidelines

### JavaScript
- Use ES6+ syntax (const/let, arrow functions, template literals)
- Add JSDoc comments for all public functions
- Follow the existing module pattern
- No external dependencies for core functionality

### CSS
- Use CSS custom properties for theming
- Follow BEM-like naming conventions
- Maintain the existing design system

### HTML
- Use semantic HTML5 elements
- Include ARIA attributes for accessibility
- Maintain WCAG 2.1 AA compliance

## Development Setup

```bash
# Clone the repo
git clone https://github.com/Ritesh12911/fifa-stadium-ai-2026.git

# Open in browser (no build step required)
open index.html

# Run tests
open tests/index.html

# Run Python tests (for Streamlit wrapper)
pip install -r requirements.txt pytest
pytest tests/test_streamlit_app.py -v
```

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
