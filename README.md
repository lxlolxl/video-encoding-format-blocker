# Video Encoding Format Blocker

A Chrome / Edge Manifest V3 extension for blocking selected video codec capability reporting on user-selected websites.

Supported block toggles:

- AV1: `av01`, `av1`
- VP9: `vp09`, `vp9`
- H.265 / HEVC: `hvc1`, `hev1`, `hevc`, `h265`, `h.265`, plus HEVC-based Dolby Vision identifiers `dvh1` and `dvhe`

The default setting blocks AV1 on YouTube and Netflix only. VP9 and H.265 / HEVC are available as optional checkboxes.

## Why this exists

Some streaming websites choose codecs based on browser capability checks. A browser may report that a format is playable even if the current device does not have efficient hardware decoding for that format. This extension lets the user hide selected codec support from chosen websites so the website may fall back to another format.

## How it works

The extension registers a Manifest V3 content script with:

- `world: "MAIN"`
- `runAt: "document_start"`
- `allFrames: true`

It patches these web APIs in the page's own JavaScript environment:

- `HTMLMediaElement.prototype.canPlayType()`
- `MediaSource.isTypeSupported()`
- `ManagedMediaSource.isTypeSupported()`
- `navigator.mediaCapabilities.decodingInfo()`
- `navigator.mediaCapabilities.encodingInfo()`
- `VideoDecoder.isConfigSupported()`
- `VideoEncoder.isConfigSupported()`

When the queried MIME type or codec configuration contains a blocked codec identifier, the extension reports that the codec is unsupported.

## Install for local testing

1. Clone or download this repository.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode.
4. Click **Load unpacked**.
5. Select the `extension/` folder.
6. Open the extension popup/options page.
7. Select the formats and websites you want to block.
8. Save, then reload the video page.

## Build a ZIP package

The Chrome Web Store upload package should contain the files inside `extension/` at the root of the ZIP.

```bash
npm run package
```

The output will be created in `dist/video-encoding-format-blocker-1.0.0.zip`.

## Testing tips

YouTube:

- Right-click the video.
- Open **Stats for nerds**.
- Check whether `Codecs` changed away from the blocked codec.

Netflix:

- Press `Ctrl + Shift + Alt + D` while playing.
- Check the displayed codec field.

Reload the page after changing rules. Already-loaded players may keep cached capability decisions until reload.

## Permissions

The extension uses:

- `storage`: stores user settings.
- `scripting`: registers the early MAIN-world script.
- Optional host permissions: requested only for the website patterns selected by the user.

The extension does not use analytics, telemetry, remote code, external scripts, cookies, web requests, or network requests.

## Documentation

- [Privacy Policy](PRIVACY.md)
- [Disclaimer](DISCLAIMER.md)
- [Third-Party Notices and References](THIRD_PARTY_NOTICES.md)
- [Chrome Web Store publishing notes](store/chrome-web-store.md)
- [Traditional Chinese README](README.zh-TW.md)

## License

MIT License. See [LICENSE](LICENSE).
