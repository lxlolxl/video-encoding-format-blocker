'use strict';

const SCRIPT_ID = 'vefb-main-world-codec-blocker';
const CODEC_ORDER = ['av1', 'vp9', 'hevc'];
const SCRIPT_BY_KEY = {
  av1: 'blockers/block-av1.js',
  vp9: 'blockers/block-vp9.js',
  hevc: 'blockers/block-hevc.js',
  'av1-vp9': 'blockers/block-av1-vp9.js',
  'av1-hevc': 'blockers/block-av1-hevc.js',
  'vp9-hevc': 'blockers/block-vp9-hevc.js',
  'av1-vp9-hevc': 'blockers/block-av1-vp9-hevc.js'
};

const DEFAULT_PATTERNS = [
  '*://*.netflix.com/*',
  '*://*.youtube.com/*',
  '*://*.youtube-nocookie.com/*',
  '*://*.youtu.be/*'
];

const DEFAULT_BLOCKED_CODECS = {
  av1: true,
  vp9: false,
  hevc: false
};

const DEFAULT_SETTINGS = {
  enabled: true,
  patterns: DEFAULT_PATTERNS,
  blockedCodecs: DEFAULT_BLOCKED_CODECS,
  language: ''
};

function normalizePatterns(patterns) {
  const source = Array.isArray(patterns) ? patterns : DEFAULT_PATTERNS;
  return [...new Set(source.map(x => String(x).trim()).filter(Boolean))];
}

function normalizeBlockedCodecs(value) {
  const source = value && typeof value === 'object' ? value : DEFAULT_BLOCKED_CODECS;
  return Object.fromEntries(CODEC_ORDER.map(codec => [codec, Boolean(source[codec])]));
}

function selectedCodecKey(blockedCodecs) {
  return CODEC_ORDER.filter(codec => blockedCodecs[codec]).join('-');
}

async function getSettings() {
  const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const blockedCodecs = normalizeBlockedCodecs(data.blockedCodecs);
  return {
    enabled: Boolean(data.enabled),
    patterns: normalizePatterns(data.patterns),
    blockedCodecs,
    language: typeof data.language === 'string' ? data.language : ''
  };
}

async function unregister() {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  } catch (_error) {
    // Ignore if the script was not registered yet.
  }
}

async function register() {
  const settings = await getSettings();
  await unregister();

  const key = selectedCodecKey(settings.blockedCodecs);
  const js = SCRIPT_BY_KEY[key];

  if (!settings.enabled || settings.patterns.length === 0 || !js) {
    return {
      ok: true,
      registered: false,
      patterns: settings.patterns,
      codecs: key ? key.split('-') : []
    };
  }

  await chrome.scripting.registerContentScripts([
    {
      id: SCRIPT_ID,
      js: [js],
      matches: settings.patterns,
      allFrames: true,
      runAt: 'document_start',
      world: 'MAIN',
      persistAcrossSessions: true
    }
  ]);

  return {
    ok: true,
    registered: true,
    patterns: settings.patterns,
    codecs: key.split('-')
  };
}

async function initializeStorage() {
  const data = await chrome.storage.sync.get(['enabled', 'patterns', 'blockedCodecs', 'language']);
  const init = {};
  if (typeof data.enabled !== 'boolean') init.enabled = DEFAULT_SETTINGS.enabled;
  if (!Array.isArray(data.patterns)) init.patterns = DEFAULT_PATTERNS;
  if (!data.blockedCodecs || typeof data.blockedCodecs !== 'object') init.blockedCodecs = DEFAULT_BLOCKED_CODECS;
  if (typeof data.language !== 'string') init.language = DEFAULT_SETTINGS.language;
  if (Object.keys(init).length) await chrome.storage.sync.set(init);
}

chrome.runtime.onInstalled.addListener(() => {
  initializeStorage().then(register).catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  register().catch(console.error);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'VEFB_REGISTER') {
    register()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ ok: false, error: error.message || String(error) }));
    return true;
  }

  if (message && message.type === 'VEFB_GET_DEFAULTS') {
    sendResponse({
      ok: true,
      defaultPatterns: DEFAULT_PATTERNS,
      defaultBlockedCodecs: DEFAULT_BLOCKED_CODECS,
      codecOrder: CODEC_ORDER
    });
    return false;
  }

  return false;
});
