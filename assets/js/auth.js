/* ============================================================
   auth.js — Physical Science · Student Authentication
   Version: 2.0.0
   Depends on: config.js, store.js
   Supports: multiple saved profiles, PIN, per-profile login
   ============================================================ */

window.Auth = (function () {
  'use strict';

  const PROFILES_KEY = 'physci_profiles';        // { lrn: {…profile, pin} }
  const SESSION_TIMEOUT_MIN = 12 * 60;

  // ---------- Paths ----------
  function loginPath() {
    const p = window.location.pathname;
    return p.includes('/student/') ? 'login.html' : 'student/login.html';
  }
  function dashboardPath() {
    const p = window.location.pathname;
    return p.includes('/student/') ? 'dashboard.html' : 'student/dashboard.html';
  }

  // ---------- Profile store ----------
  function getProfilesMap() {
    try {
      const raw = localStorage.getItem(PROFILES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveProfilesMap(map) {
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(map)); return true; }
    catch (e) { return false; }
  }

  function getProfiles() {
    const map = getProfilesMap();
    return Object.values(map).sort((a, b) =>
      new Date(b.lastLogin || b.loggedInAt || 0) - new Date(a.lastLogin || a.loggedInAt || 0)
    );
  }

  function getProfileByLrn(lrn) {
    if (!lrn) return null;
    return getProfilesMap()[String(lrn)] || null;
  }

  function saveProfile(profile) {
    if (!profile || !profile.lrn) throw new Error('Profile must have an LRN');
    const map = getProfilesMap();
    const existing = map[profile.lrn] || {};
    map[profile.lrn] = Object.assign({}, existing, profile, {
      savedAt: new Date().toISOString()
    });
    return saveProfilesMap(map);
  }

  function deleteProfile(lrn) {
    const map = getProfilesMap();
    delete map[lrn];
    return saveProfilesMap(map);
  }

  // ---------- Session ----------
  function getStudent() {
    return (window.Store && Store.getStudent()) || null;
  }

  function isLoggedIn() {
    const s = getStudent();
    if (!s || !s.lrn) return false;
    if (s.loggedInAt) {
      const age = (Date.now() - new Date(s.loggedInAt).getTime()) / 60000;
      if (age > SESSION_TIMEOUT_MIN) { logout(); return false; }
    }
    return true;
  }

  function login(student) {
    if (!student || !student.lrn) throw new Error('Invalid student data');
    const payload = Object.assign({}, student, { loggedInAt: new Date().toISOString() });
    Store.setStudent(payload);
    return payload;
  }

  function loginWithProfile(profile) {
    // Update last login in profile store, then set session
    profile.lastLogin = new Date().toISOString();
    saveProfile(profile);
    return login(profile);
  }

  // ---------- Logout with auto-backup prompt ----------
  async function logout(opts) {
    const options = Object.assign({ silent: false }, opts || {});
    const s = getStudent();

    if (s && s.lrn && !options.silent) {
      // Every logout asks about saving a backup
      const save = window.confirm(
        `💾 Save your progress before you log out?\n\n` +
        `This will download a backup file you can import on any device.\n\n` +
        `Click OK to download, or Cancel to log out without saving.`
      );

      if (save) {
        try {
          await downloadBackup(s);
        } catch (e) {
          console.warn('Backup download failed:', e);
        }
      }
    }

    Store.clearStudent();
    window.location.href = loginPath();
  }

  // ---------- Auto-backup helper ----------
  async function downloadBackup(student) {
    const records = (window.Store && Store.getRecords() || [])
      .filter(r => String(r.lrn) === String(student.lrn));
    const snapshot = {
      version: 1,
      app: 'Physical Science Online Modular App',
      appVersion: (window.PHYSCI_CONFIG && window.PHYSCI_CONFIG.version) || '1.0.0',
      exportedAt: new Date().toISOString(),
      reason: 'auto-logout-backup',
      student,
      records,
      progress: (window.Store && Store.getProgress()) || {},
      codes: (window.Store && Store.getCodes()) || []
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physci-backup-${student.lrn}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (window.UI) UI.toast('⬇ Backup saved', 'success', 2500);
    return snapshot;
  }

  // ---------- Guards ----------
  function requireStudent() {
    if (!isLoggedIn()) {
      window.location.href = loginPath();
      return null;
    }
    return getStudent();
  }

  function refreshSession() {
    const s = getStudent();
    if (!s) return false;
    s.loggedInAt = new Date().toISOString();
    return Store.setStudent(s);
  }

  return {
    // profiles
    getProfiles, getProfileByLrn, saveProfile, deleteProfile,

    // session
    isLoggedIn, login, loginWithProfile, logout, refreshSession,
    requireStudent, getStudent,

    // helpers
    downloadBackup,
    loginPath, dashboardPath
  };
})();
