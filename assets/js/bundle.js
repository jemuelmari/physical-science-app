/* ============================================================
   bundle.js — Physical Science · Script Bundler / Loader
   Version: 1.0.0
   Depends on: config.js
   Purpose: Guarantees all core scripts are loaded in dependency
            order, so pages only need to include `bundle.js`.
            Non-blocking: uses `defer`-like async loading.
   ============================================================ */

window.Bundle = (function () {
  'use strict';

  // Resolve asset path relative to the current page
  function resolveBase() {
    const path = window.location.pathname;
    if (path.includes('/student/physci/week')) return '../../';
    if (path.includes('/student/physci/'))     return '../';
    if (path.includes('/student/assessments/'))return '../../';
    if (path.includes('/student/'))            return '../';
    if (path.includes('/teacher/'))            return '../';
    if (path.includes('/classrecord/'))        return '../';
    return ''; // repo root
  }

  // Load order matters: modules build on each other.
  const CORE_SCRIPTS = [
    'store.js',
    'security.js',
    'transmutation.js',
    'app.js',
    'auth.js',
    'teacher-auth.js',
    'teacher.js',
    'activity-tracker.js',
    'activity-gate.js',
    'sync.js',
    'ui-helpers.js',
    'backup.js',
    'dashboard.js',
    'classrecord.js',
    'lesson-engine.js',
    'quiz-engine.js'
  ];

  const loaded = new Set();
  const pending = new Map();

  function loadScript(src) {
    if (loaded.has(src)) return Promise.resolve();
    if (pending.has(src)) return pending.get(src);

    const p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = false; // preserve order
      s.onload = () => { loaded.add(src); pending.delete(src); resolve(); };
      s.onerror = () => { pending.delete(src); reject(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
    pending.set(src, p);
    return p;
  }

  async function loadAll() {
    const base = resolveBase() + 'assets/js/';
    for (const name of CORE_SCRIPTS) {
      try {
        await loadScript(base + name);
      } catch (e) {
        console.warn('[Bundle] Skipped:', name, e.message);
      }
    }
  }

  function load(names) {
    const base = resolveBase() + 'assets/js/';
    const list = Array.isArray(names) ? names : [names];
    return Promise.all(list.map(n => loadScript(base + n)));
  }

  // Auto-load if `data-bundle="auto"` attribute exists on the <script> tag
  (function autoInit() {
    const me = document.currentScript;
    if (me && me.dataset && me.dataset.bundle === 'auto') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAll);
      } else {
        loadAll();
      }
    }
  })();

  return {
    loadAll,
    load,
    loadScript,
    resolveBase
  };
})();
