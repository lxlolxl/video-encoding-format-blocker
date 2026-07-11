'use strict';

const CODEC_ORDER = ['av1', 'vp9', 'hevc'];

const DEFAULT_PATTERNS = [
  '*://*.netflix.com/*',
  '*://*.youtube.com/*',
  '*://*.youtube-nocookie.com/*',
  '*://*.youtu.be/*'
];

const YOUTUBE_PATTERNS = [
  '*://*.youtube.com/*',
  '*://*.youtube-nocookie.com/*',
  '*://*.youtu.be/*'
];

const NETFLIX_PATTERNS = [
  '*://*.netflix.com/*'
];

const DEFAULT_BLOCKED_CODECS = {
  av1: true,
  vp9: false,
  hevc: false
};

const STRINGS = {
  en: {
    appTitle: 'Video Encoding Format Blocker',
    subtitle: 'Block selected video codec capability reporting on chosen websites.',
    languageLabel: 'Language',
    enabledLabel: 'Enable blocker on selected websites',
    formatsTitle: 'Blocked video formats',
    av1Hint: 'Blocks av01 / AV1 capability checks.',
    vp9Hint: 'Blocks vp09 / VP9 capability checks.',
    hevcHint: 'Blocks hvc1 / hev1 and HEVC-based Dolby Vision identifiers.',
    formatHint: 'Default is AV1 only. Blocking too many formats may force lower quality or make some videos unavailable.',
    sitesTitle: 'Target websites',
    patternHint1: 'Use Chrome match patterns, one per line.',
    defaultsButton: 'Restore defaults',
    youtubeButton: 'YouTube only',
    netflixButton: 'Netflix only',
    youtubeNetflixButton: 'YouTube + Netflix',
    permissionTitle: 'Permission note',
    permissionText: 'When saving, Chrome may ask for permission to run on the patterns you entered. The extension only registers scripts on the sites listed above.',
    saveButton: 'Save and register',
    savedRegistered: 'Registered {count} site rule(s), blocking {codecs}. Reload the video page.',
    savedDisabled: 'Disabled. Reload open video pages if needed.',
    noCodec: 'No codec selected. The blocker is not registered.',
    permissionDenied: 'Permission was not granted, so the rules were not registered.',
    registerFailed: 'Registration failed: {error}. Check the match pattern format.',
    loadFailed: 'Failed to load settings: {error}.',
    savedLanguage: 'Language updated.'
  },
  'zh-TW': {
    appTitle: 'Video Encoding Format Blocker',
    subtitle: '在指定網站封鎖所選影片編碼格式的支援回報。',
    languageLabel: '語言',
    enabledLabel: '在指定網站啟用封鎖',
    formatsTitle: '要禁用的影片格式',
    av1Hint: '封鎖 av01 / AV1 支援偵測。',
    vp9Hint: '封鎖 vp09 / VP9 支援偵測。',
    hevcHint: '封鎖 hvc1 / hev1，以及 HEVC 架構的 Dolby Vision 識別碼。',
    formatHint: '預設只封鎖 AV1。封鎖太多格式可能會讓影片退到較低畫質，或導致部分影片無法播放。',
    sitesTitle: '指定網站',
    patternHint1: '使用 Chrome match pattern，每行一個。',
    defaultsButton: '恢復預設',
    youtubeButton: '只套用 YouTube',
    netflixButton: '只套用 Netflix',
    youtubeNetflixButton: 'YouTube + Netflix',
    permissionTitle: '權限說明',
    permissionText: '儲存時，Chrome 可能會要求允許擴充功能在你填入的網站上執行。本擴充只會在上方列出的網站註冊腳本。',
    saveButton: '儲存並重新註冊',
    savedRegistered: '已註冊 {count} 條網站規則，正在封鎖 {codecs}。請重新整理影片頁面。',
    savedDisabled: '已停用。必要時請重新整理已開啟的影片頁面。',
    noCodec: '未選擇任何格式，因此不會註冊封鎖腳本。',
    permissionDenied: '未授權網站權限，因此規則未註冊。',
    registerFailed: '註冊失敗：{error}。請確認 match pattern 格式。',
    loadFailed: '載入設定失敗：{error}。',
    savedLanguage: '語言已更新。'
  }
};

const enabledEl = document.getElementById('enabled');
const patternsEl = document.getElementById('patterns');
const statusEl = document.getElementById('status');
const languageEl = document.getElementById('language');
const codecEls = Object.fromEntries(CODEC_ORDER.map(codec => [codec, document.getElementById(`codec-${codec}`)]));

let currentLanguage = 'en';

function browserDefaultLanguage() {
  const locale = (chrome.i18n && chrome.i18n.getUILanguage ? chrome.i18n.getUILanguage() : navigator.language || '').toLowerCase();
  return locale.startsWith('zh') ? 'zh-TW' : 'en';
}

function t(key, values = {}) {
  const text = (STRINGS[currentLanguage] && STRINGS[currentLanguage][key]) || STRINGS.en[key] || key;
  return text.replace(/\{(\w+)\}/g, (_m, name) => values[name] ?? '');
}

function applyLanguage(language) {
  currentLanguage = STRINGS[language] ? language : browserDefaultLanguage();
  document.documentElement.lang = currentLanguage;
  languageEl.value = currentLanguage;
  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
}

function setStatus(text, ok = true) {
  statusEl.textContent = text;
  statusEl.classList.toggle('ok', ok);
  statusEl.classList.toggle('error', !ok);
}

function parsePatterns() {
  return patternsEl.value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

function uniquePatterns(patterns) {
  return [...new Set(patterns.map(String).map(s => s.trim()).filter(Boolean))];
}

function getBlockedCodecsFromUi() {
  return Object.fromEntries(CODEC_ORDER.map(codec => [codec, Boolean(codecEls[codec].checked)]));
}

function selectedCodecLabels(blockedCodecs = getBlockedCodecsFromUi()) {
  const labels = { av1: 'AV1', vp9: 'VP9', hevc: 'H.265 / HEVC' };
  return CODEC_ORDER.filter(codec => blockedCodecs[codec]).map(codec => labels[codec]);
}

function setBlockedCodecsUi(blockedCodecs) {
  const source = blockedCodecs && typeof blockedCodecs === 'object' ? blockedCodecs : DEFAULT_BLOCKED_CODECS;
  for (const codec of CODEC_ORDER) {
    codecEls[codec].checked = Boolean(source[codec]);
  }
}

async function ensureHostPermissions(patterns) {
  if (patterns.length === 0) return true;
  const contains = await chrome.permissions.contains({ origins: patterns });
  if (contains) return true;
  return chrome.permissions.request({ origins: patterns });
}

async function load() {
  const data = await chrome.storage.sync.get({
    enabled: true,
    patterns: DEFAULT_PATTERNS,
    blockedCodecs: DEFAULT_BLOCKED_CODECS,
    language: ''
  });

  applyLanguage(data.language || browserDefaultLanguage());
  enabledEl.checked = Boolean(data.enabled);
  patternsEl.value = (Array.isArray(data.patterns) ? data.patterns : DEFAULT_PATTERNS).join('\n');
  setBlockedCodecsUi(data.blockedCodecs);
}

async function save(patterns = parsePatterns(), blockedCodecs = getBlockedCodecsFromUi()) {
  const cleaned = uniquePatterns(patterns);
  const selected = selectedCodecLabels(blockedCodecs);

  if (enabledEl.checked && cleaned.length && selected.length) {
    const granted = await ensureHostPermissions(cleaned);
    if (!granted) {
      setStatus(t('permissionDenied'), false);
      return;
    }
  }

  await chrome.storage.sync.set({
    enabled: enabledEl.checked,
    patterns: cleaned,
    blockedCodecs,
    language: currentLanguage
  });

  const result = await chrome.runtime.sendMessage({ type: 'VEFB_REGISTER' });
  if (result && result.ok) {
    patternsEl.value = cleaned.join('\n');
    if (!enabledEl.checked) {
      setStatus(t('savedDisabled'));
    } else if (!selected.length) {
      setStatus(t('noCodec'));
    } else {
      setStatus(t('savedRegistered', { count: cleaned.length, codecs: selected.join(', ') }));
    }
  } else {
    setStatus(t('registerFailed', { error: result?.error || 'unknown error' }), false);
  }
}

function setPreset(patterns) {
  patternsEl.value = patterns.join('\n');
  enabledEl.checked = true;
}

document.getElementById('save').addEventListener('click', () => {
  save().catch(error => setStatus(t('registerFailed', { error: error.message || String(error) }), false));
});

document.getElementById('defaults').addEventListener('click', () => {
  setPreset(DEFAULT_PATTERNS);
  setBlockedCodecsUi(DEFAULT_BLOCKED_CODECS);
});

document.getElementById('yt').addEventListener('click', () => setPreset(YOUTUBE_PATTERNS));
document.getElementById('nf').addEventListener('click', () => setPreset(NETFLIX_PATTERNS));
document.getElementById('yt-nf').addEventListener('click', () => setPreset(DEFAULT_PATTERNS));

languageEl.addEventListener('change', async () => {
  applyLanguage(languageEl.value);
  await chrome.storage.sync.set({ language: currentLanguage });
  setStatus(t('savedLanguage'));
});

load().catch(error => {
  applyLanguage(browserDefaultLanguage());
  setStatus(t('loadFailed', { error: error.message || String(error) }), false);
});
