# Third-Party Notices and References

This project does not bundle third-party runtime code, npm packages, fonts, or media assets.

The implementation and documentation refer to these public technical resources:

- Chrome Extensions documentation: Manifest V3, `chrome.scripting`, optional host permissions, Chrome Web Store publishing, and internationalization.
  - https://developer.chrome.com/docs/extensions/
  - https://developer.chrome.com/docs/extensions/reference/api/scripting
  - https://developer.chrome.com/docs/extensions/develop/ui/i18n
  - https://developer.chrome.com/docs/webstore/publish
- MDN Web Docs: media MIME `codecs` parameter and Media Capabilities concepts.
  - https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter
  - https://developer.mozilla.org/en-US/docs/Web/API/MediaCapabilities/decodingInfo
- MP4 Registration Authority: sample-entry codec identifiers such as `hvc1`, `hev1`, and related four-character codes.
  - https://mp4ra.org/registered-types/codecs
- User-provided testing reference: a YouTube-focused codec-blocking extension package was used only to verify the general compatibility pattern of early MAIN-world codec API patching. No source code from that package is included or copied into this project.

Codec identifiers handled by this extension include:

- AV1: `av01`, `av1`
- VP9: `vp09`, `vp9`
- H.265 / HEVC: `hvc1`, `hev1`, `hevc`, `h265`, `h.265`
- HEVC-based Dolby Vision identifiers: `dvh1`, `dvhe`
