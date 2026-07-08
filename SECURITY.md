# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Security Measures

StadiumIQ implements the following security controls:

### Content Security Policy (CSP)
- Strict CSP meta tag prevents XSS and code injection
- Only allows connections to Google Fonts and Google Gemini API
- No inline script evaluation (`eval`) permitted

### Input Sanitization
- All user input is sanitized before being sent to AI models
- HTML tags are stripped from input
- Input length is capped to prevent abuse
- XSS protection on all rendered output

### API Key Handling
- API keys are stored in memory only (JavaScript variable)
- Keys are **never** persisted to localStorage, cookies, or any storage
- Keys are only transmitted to `generativelanguage.googleapis.com`

### No Third-Party Tracking
- Zero analytics or tracking scripts
- No external dependencies for core functionality
- Only external connections: Google Fonts (CSS) and Google AI API

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email: ritesh12911@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
4. You will receive a response within 48 hours

## Disclosure Policy

- We will acknowledge receipt within 48 hours
- We will confirm the vulnerability and determine its impact
- We will release a fix and credit the reporter (if desired)
