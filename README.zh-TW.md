# Video Encoding Format Blocker

這是一個 Chrome / Edge Manifest V3 擴充功能，可以在使用者指定的網站上，封鎖特定影片編碼格式的支援回報。

目前支援勾選禁用：

- AV1：`av01`、`av1`
- VP9：`vp09`、`vp9`
- H.265 / HEVC：`hvc1`、`hev1`、`hevc`、`h265`、`h.265`，以及基於 HEVC 的 Dolby Vision 識別碼 `dvh1`、`dvhe`

預設只會在 YouTube 與 Netflix 封鎖 AV1。VP9 與 H.265 / HEVC 需要使用者自行勾選。

## 為什麼需要這個擴充功能

有些串流網站會根據瀏覽器的能力偵測結果選擇影片格式。瀏覽器可能回報某個格式「可以播放」，但你的硬體不一定有高效率硬體解碼。這個擴充功能可以讓指定網站看不到你勾選的格式支援，讓網站比較可能退回其他格式。

## 工作方式

此擴充功能使用 Manifest V3 動態註冊 content script，設定為：

- `world: "MAIN"`
- `runAt: "document_start"`
- `allFrames: true`

它會在網頁自己的 JavaScript 環境中攔截：

- `HTMLMediaElement.prototype.canPlayType()`
- `MediaSource.isTypeSupported()`
- `ManagedMediaSource.isTypeSupported()`
- `navigator.mediaCapabilities.decodingInfo()`
- `navigator.mediaCapabilities.encodingInfo()`
- `VideoDecoder.isConfigSupported()`
- `VideoEncoder.isConfigSupported()`

當網站查詢的 MIME type 或 codec 設定包含你勾選要封鎖的格式時，擴充功能會回報「不支援」。

## 本機測試安裝

1. 下載或 clone 這個專案。
2. 開啟 `chrome://extensions` 或 `edge://extensions`。
3. 開啟「開發人員模式」。
4. 點「載入未封裝項目」。
5. 選擇 `extension/` 資料夾。
6. 開啟擴充功能彈出視窗或選項頁。
7. 勾選要封鎖的格式，並填入指定網站。
8. 儲存後重新整理影片頁面。

## 建立 Chrome Web Store ZIP

Chrome Web Store 上傳的 ZIP 需要讓 `extension/` 裡的檔案位於 ZIP 根目錄。

```bash
npm run package
```

輸出檔會在 `dist/video-encoding-format-blocker-1.0.0.zip`。

## 測試方式

YouTube：

- 在影片上按右鍵。
- 開啟「詳細統計資料」。
- 檢查 `Codecs` 是否避開被封鎖的格式。

Netflix：

- 播放時按 `Ctrl + Shift + Alt + D`。
- 查看 codec 欄位。

每次修改規則後建議重新整理頁面，因為已載入的播放器可能會快取能力偵測結果。

## 權限說明

此擴充功能使用：

- `storage`：儲存使用者設定。
- `scripting`：註冊早期 MAIN world 腳本。
- optional host permissions：只在使用者儲存指定網站規則時要求授權。

此擴充功能不使用分析、遙測、遠端程式碼、外部腳本、Cookie、webRequest 或網路請求。

## 文件

- [隱私權政策](PRIVACY.md)
- [免責聲明](DISCLAIMER.md)
- [第三方聲明與引用資料](THIRD_PARTY_NOTICES.md)
- [Chrome Web Store 上架筆記](store/chrome-web-store.md)
- [English README](README.md)

## 授權

MIT License。請見 [LICENSE](LICENSE)。
