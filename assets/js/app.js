/* ============================================================
   app.js — Physical Science · App Bootstrap
   Version: 1.1.0
   Depends on: config.js, store.js, ui-helpers.js
   ============================================================ */

window.App = (function () {
  'use strict';

  const REGISTRY_URL = (function () {
    const path = window.location.pathname;
    if (path.includes('/student/physci/week')) return '../../data/physci-registry.json';
    if (path.includes('/student/physci/'))     return '../data/physci-registry.json';
    if (path.includes('/student/assessments/'))return '../../data/physci-registry.json';
    if (path.includes('/student/'))            return '../data/physci-registry.json';
    if (path.includes('/teacher/'))            return '../data/physci-registry.json';
    if (path.includes('/classrecord/'))        return '../data/physci-registry.json';
    return 'data/physci-registry.json';
  })();

  let registry = null;

  // ---- Load registry ----
  async function loadRegistry() {
    if (registry) return registry;
    try {
      const res = await fetch(REGISTRY_URL);
      if (!res.ok) throw new Error('Registry HTTP ' + res.status);
      registry = await res.json();
      return registry;
    } catch (e) {
      console.warn('App.loadRegistry failed, using fallback:', e);
      registry = { weeks: [], assessments: [], gating: {}, features: {}, storageKeys: {} };
      return registry;
    }
  }

  function getRegistry() {
    return registry || { weeks: [], assessments: [], gating: {}, features: {}, storageKeys: {} };
  }

  function getWeeks() {
    return getRegistry().weeks || [];
  }

  function getAssessments() {
    return getRegistry().assessments || [];
  }

  function getAssessment(id) {
    return getAssessments().find(a => a.id === id) || null;
  }

  function getWeek(n) {
    return getWeeks().find(w => Number(w.n) === Number(n)) || null;
  }

  function getGating(assessmentId) {
    const g = getRegistry().gating || {};
    return g[assessmentId] || null;
  }

  // ---- Feature flags ----
  function featureEnabled(name) {
    const cfg = window.PHYSCI_CONFIG || {};
    const reg = (getRegistry().features || {});
    if (typeof reg[name] === 'boolean') return reg[name];
    if (typeof cfg[name] === 'boolean') return cfg[name];
    return true;
  }

  // ---- Config shortcuts ----
  function config() {
    return window.PHYSCI_CONFIG || {};
  }

  function passingScore() {
    return Number(config().passingScore) || 75;
  }

  function isPassing(percent) {
    return Number(percent) >= passingScore();
  }

  // ---- Developer Info ----
  function dev() {
    return (window.PHYSCI_CONFIG && window.PHYSCI_CONFIG.DEVELOPER) || null;
  }

  function injectDevCredit() {
    const devInfo = dev();
    if (!devInfo || !devInfo.name) return;

    const slots = document.querySelectorAll('#dev-credit, .dev-credit-slot');
    if (!slots.length) return;

    const html = (window.UI && UI.devCredit) ? UI.devCredit() : buildFallback(devInfo);
    slots.forEach(slot => { slot.innerHTML = html; });
  }

  function buildFallback(d) {
    return `
      <div class="dev-credit">
        <div class="dev-credit-name">${d.name}</div>
        <div class="dev-credit-position">${d.position || ''}</div>
        <div class="dev-credit-school">${d.school || ''}</div>
      </div>
    `;
  }

  // ---- Logout ----
  function logoutStudent() {
    if (window.Store) Store.clearStudent();
    const here = window.location.pathname;
    const loginPath = here.includes('/student/') ? 'login.html' : 'student/login.html';
    window.location.href = loginPath;
  }

  function logoutTeacher() {
    if (window.Store) Store.clearTeacher();
    const here = window.location.pathname;
    const loginPath = here.includes('/teacher/') ? '../teacher-login.html' : 'teacher-login.html';
    window.location.href = loginPath;
  }

  // ---- Auto logout overlay ----
  function showLogoutOverlay() {
    let el = document.getElementById('gba-logout-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gba-logout-overlay';
      el.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.5);
        display:flex; align-items:center; justify-content:center;
        z-index:9999; color:#fff; font-size:1.2rem;
      `;
      el.textContent = 'Logging out…';
      document.body.appendChild(el);
    }
    el.style.display = 'flex';
  }

    async function logout({ teacher = false } = {}) {
    // Teacher logout → simple
    if (teacher) {
      showLogoutOverlay();
      try {
        if (window.Sync && typeof Sync.flush === 'function') {
          await Sync.flush().catch(() => {});
        }
      } catch (e) { /* noop */ }
      setTimeout(() => logoutTeacher(), 250);
      return;
    }

    // Student logout → prompt for backup via Auth.logout()
    try {
      if (window.Sync && typeof Sync.flush === 'function') {
        await Sync.flush().catch(() => {});
      }
    } catch (e) { /* noop */ }

    if (window.Auth && typeof Auth.logout === 'function') {
      await Auth.logout();
    } else {
      // Fallback if Auth not loaded
      showLogoutOverlay();
      setTimeout(() => logoutStudent(), 250);
    }
  }

  // ---- Redirect guards ----
  function requireStudent() {
    const s = window.Store ? Store.getStudent() : null;
    if (!s) {
      const here = window.location.pathname;
      const loginPath = here.includes('/student/') ? 'login.html' : 'student/login.html';
      window.location.href = loginPath;
      return null;
    }
    return s;
  }

  function requireTeacher() {
    const t = window.Store ? Store.getTeacher() : null;
    if (!t) {
      const here = window.location.pathname;
      const loginPath = here.includes('/teacher/') ? '../teacher-login.html' : 'teacher-login.html';
      window.location.href = loginPath;
      return null;
    }
    return t;
  }

  // ---- Bind logout buttons ----
  function bindLogoutButtons() {
    document.querySelectorAll('[data-action="logout-student"]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); logout({ teacher: false }); });
    });
    document.querySelectorAll('[data-action="logout-teacher"]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); logout({ teacher: true }); });
    });
  }

  // ---- Auto-init ----
  document.addEventListener('DOMContentLoaded', () => {
    loadRegistry();
    bindLogoutButtons();
    injectDevCredit();
  });

  // ---- Public ----
  return {
    loadRegistry, getRegistry,
    getWeeks, getWeek,
    getAssessments, getAssessment, getGating,
    featureEnabled,
    config, passingScore, isPassing,
    logout, logoutStudent, logoutTeacher,
    requireStudent, requireTeacher,
    dev,
    injectDevCredit
  };
})();
