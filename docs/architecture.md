# Architecture

## Extension flow

1. The user opens the popup/options page.
2. The user chooses language, target websites, and blocked codecs.
3. The extension requests optional host permissions for those website match patterns.
4. The service worker unregisters the previous dynamic content script.
5. The service worker registers one MAIN-world content script matching the selected codec combination.
6. On the next page load, the script patches media capability APIs at `document_start`.

## Why there are multiple blocker files

Manifest V3 dynamic content scripts cannot directly pass arbitrary runtime settings into a MAIN-world JavaScript file at registration time. This project supports only three codec toggles, so it uses pre-generated static files for the seven possible non-empty combinations:

- AV1
- VP9
- HEVC
- AV1 + VP9
- AV1 + HEVC
- VP9 + HEVC
- AV1 + VP9 + HEVC

This keeps the code compatible with early MAIN-world injection while still allowing user-selectable codec toggles.

## Why MAIN world matters

Some video players query media capability APIs from the page's own JavaScript environment early during startup. Running in the extension isolated world may not affect those checks. MAIN-world injection at `document_start` makes the patched functions visible to the page before many players initialize.
