/* ============================================================
   security.js — Physical Science · Client-side crypto helpers
   Version: 1.0.0
   Depends on: config.js
   ============================================================ */

window.Security = (function () {
  'use strict';

  // ---- Bytes → hex ----
  function bytesToHex(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
      const b = (bytes[i] < 0 ? bytes[i] + 256 : bytes[i]).toString(16);
      out += (b.length === 1 ? '0' : '') + b;
    }
    return out;
  }

  // ---- SHA-256 (hex) ----
  async function sha256Hex(message) {
    if (!window.crypto || !window.crypto.subtle) {
      // Fallback for insecure contexts: simple non-crypto hash
      return simpleHash(message);
    }
    const enc = new TextEncoder();
    const data = enc.encode(String(message));
    const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
    return bytesToHex(new Uint8Array(hashBuf));
  }

  // ---- HMAC-SHA256 (hex) ----
  async function hmacSha256Hex(message, secret) {
    if (!window.crypto || !window.crypto.subtle) {
      return simpleHash(secret + '|' + message);
    }
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(String(secret)),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuf = await window.crypto.subtle.sign('HMAC', key, enc.encode(String(message)));
    return bytesToHex(new Uint8Array(sigBuf));
  }

  // ---- Simple fallback hash (non-crypto) ----
  function simpleHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return ((h2 >>> 0).toString(16).padStart(8, '0')) + ((h1 >>> 0).toString(16).padStart(8, '0'));
  }

  // ---- Sign an object with the configured gas token ----
  async function signPayload(payload) {
    const token = (window.PHYSCI_CONFIG && window.PHYSCI_CONFIG.gasToken) || '';
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return hmacSha256Hex(str, token);
  }

  // ---- Verify a teacher token against a stored hash (client-side gate) ----
  async function verifyTeacherToken(token, hashHex) {
    const h = await sha256Hex(token);
    return h === hashHex;
  }

  return {
    sha256Hex,
    hmacSha256Hex,
    signPayload,
    verifyTeacherToken,
    simpleHash
  };
})();
