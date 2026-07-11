(() => {
  'use strict';

  const BLOCKED_CODECS = Object.freeze(['vp9']);
  if (window.__VEFB_CODEC_BLOCKER_PATCHED__) return;
  Object.defineProperty(window, '__VEFB_CODEC_BLOCKER_PATCHED__', { value: { blockedCodecs: BLOCKED_CODECS.slice(), version: '1.0.0' } });

  const tests = {
    av1: [/(^|[^a-z0-9])av01([.\s,;"']|$)/i, /(^|[^a-z0-9])av1([^a-z0-9]|$)/i],
    vp9: [/(^|[^a-z0-9])vp09([.\s,;"']|$)/i, /(^|[^a-z0-9])vp9([^a-z0-9]|$)/i],
    hevc: [/(^|[^a-z0-9])hvc1([.\s,;"']|$)/i, /(^|[^a-z0-9])hev1([.\s,;"']|$)/i, /(^|[^a-z0-9])hevc([^a-z0-9]|$)/i, /(^|[^a-z0-9])h265([^a-z0-9]|$)/i, /(^|[^a-z0-9])h\.265([^a-z0-9]|$)/i, /(^|[^a-z0-9])dvh1([.\s,;"']|$)/i, /(^|[^a-z0-9])dvhe([.\s,;"']|$)/i]
  };
  const hasBlockedCodec = value => typeof value === 'string' && BLOCKED_CODECS.some(codec => tests[codec].some(re => re.test(value)));
  function scanConfig(value, depth = 0, seen = new Set()) { if (value == null || depth > 5) return false; if (typeof value === 'string') return hasBlockedCodec(value); if (typeof value !== 'object' || seen.has(value)) return false; seen.add(value); for (const key of ['contentType','mimeType','type','codecs','codec']) if (hasBlockedCodec(value[key])) return true; return scanConfig(value.video, depth + 1, seen) || scanConfig(value.audio, depth + 1, seen) || scanConfig(value.config, depth + 1, seen); }
  function patch(owner, name, factory) { try { if (!owner || typeof owner[name] !== 'function') return; const original = owner[name]; Object.defineProperty(owner, name, { value: factory(original), configurable: true, writable: true }); } catch (_) {} }
  patch(window.HTMLMediaElement && window.HTMLMediaElement.prototype, 'canPlayType', original => function(type) { return hasBlockedCodec(type) ? '' : original.apply(this, arguments); });
  patch(window.MediaSource, 'isTypeSupported', original => function(type) { return hasBlockedCodec(type) ? false : original.apply(this, arguments); });
  patch(window.ManagedMediaSource, 'isTypeSupported', original => function(type) { return hasBlockedCodec(type) ? false : original.apply(this, arguments); });
  if (navigator.mediaCapabilities) { patch(navigator.mediaCapabilities, 'decodingInfo', original => function(config) { return scanConfig(config) ? Promise.resolve({ supported: false, smooth: false, powerEfficient: false, keySystemAccess: null }) : original.apply(this, arguments); }); patch(navigator.mediaCapabilities, 'encodingInfo', original => function(config) { return scanConfig(config) ? Promise.resolve({ supported: false, smooth: false, powerEfficient: false }) : original.apply(this, arguments); }); }
  patch(window.VideoDecoder, 'isConfigSupported', original => function(config) { return scanConfig(config) ? Promise.resolve({ supported: false, config }) : original.apply(this, arguments); });
  patch(window.VideoEncoder, 'isConfigSupported', original => function(config) { return scanConfig(config) ? Promise.resolve({ supported: false, config }) : original.apply(this, arguments); });
})();
