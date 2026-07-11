# Security Policy

## Supported versions

Only the latest released version is supported.

## Reporting a vulnerability

Please open a private security advisory on GitHub if the repository is hosted on GitHub, or contact the maintainer through the project issue tracker with a minimal reproduction. Do not include sensitive personal data in public issues.

## Security model

The extension uses Manifest V3, optional host permissions, `chrome.scripting.registerContentScripts()`, and MAIN-world script injection. It does not use remote code, `eval()`, external scripts, analytics, telemetry, or network requests.
