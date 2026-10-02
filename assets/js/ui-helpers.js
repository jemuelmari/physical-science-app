/* ============================================================
   ui-helpers.js — Physical Science · UI Utilities
   Version: 1.1.0
   Depends on: config.js
   ============================================================ */

window.UI = (function () {
  'use strict';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatTime(seconds) {
    const s = Math.max(0, Number(seconds) || 0);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const r = (s % 60).toString().padStart(2, '0');
    return `${m}:${r}`;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return '—'; }
  }

  function plClass(grade) {
    const g = Number(grade);
    if (g >= 90) return 'pl-mastered';
    if (g >= 85) return 'pl-closely';
    if (g >= 80) return 'pl-moving';
    if (g >= 75) return 'pl-average';
    if (g >= 70) return 'pl-low';
    if (g >= 60) return 'pl-verylow';
    return 'pl-nomastery';
  }

  function plLabel(grade) {
    const g = Number(grade);
    if (g >= 90) return 'Mastered';
    if (g >= 85) return 'Closely Approximating Mastery';
    if (g >= 80) return 'Moving Towards Mastery';
    if (g >= 75) return 'Average';
    if (g >= 70) return 'Low';
    if (g >= 60) return 'Very Low';
    return 'No Mastery';
  }

  // ---- Avatar ----
  function avatarClass(seed) {
    const s = String(seed || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 'av-' + ((s % 6) + 1);
  }

  function initials(first, last) {
    const f = (first || '').trim().charAt(0).toUpperCase();
    const l = (last || '').trim().charAt(0).toUpperCase();
    return (f || '?') + (l || '');
  }

  // ---- Toast ----
  function toast(message, type, timeoutMs) {
    const t = document.createElement('div');
    t.className = 'ui-toast ' + (type || 'info');
    t.textContent = message;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 250);
    }, timeoutMs || 2500);
  }

  // ---- Confirm ----
  function confirmDialog(message) {
    return window.confirm(message);
  }

  // ---- Badge HTML ----
  function badge(text, cls) {
    return `<span class="badge ${cls || ''}">${escapeHtml(text)}</span>`;
  }

  function gradeBadge(grade) {
    return badge(grade, plClass(grade));
  }

  // ---- Developer Credit (HTML) ----
  function devCredit(options) {
    const opts = options || {};
    const dev = (window.PHYSCI_CONFIG && window.PHYSCI_CONFIG.DEVELOPER) || {};
    if (!dev.name) return '';

    const compact = !!opts.compact;

    if (compact) {
      return `
        <div class="dev-credit dev-credit-compact">
          <div><strong>${escapeHtml(dev.name)}</strong></div>
          <div>${escapeHtml(dev.school)} · ${escapeHtml(dev.division)}</div>
        </div>
      `;
    }

    return `
      <div class="dev-credit">
        <div class="dev-credit-name">${escapeHtml(dev.name)}</div>
        <div class="dev-credit-position">${escapeHtml(dev.position)}</div>
        <div class="dev-credit-school">${escapeHtml(dev.school)}</div>
        <div class="dev-credit-division">${escapeHtml(dev.district)} · ${escapeHtml(dev.division)}</div>
        <div class="dev-credit-region">${escapeHtml(dev.region)} · ${escapeHtml(dev.department)}</div>
      </div>
    `;
  }

  return {
    $, $$,
    escapeHtml,
    formatTime,
    formatDate,
    plClass,
    plLabel,
    avatarClass,
    initials,
    toast,
    confirm: confirmDialog,
    badge,
    gradeBadge,
    devCredit
  };
})();
