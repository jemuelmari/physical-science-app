/* ============================================================
   teacher-auth.js — Physical Science · Teacher Authentication
   Version: 1.0.0
   Depends on: config.js, store.js, security.js
   ============================================================ */

window.TeacherAuth = (function () {
  'use strict';

  // SHA-256 hash of the teacher token
  // Regenerate this when you change the teacher token!
  const TEACHER_TOKEN_HASH = '01d58c1ac3df6d023d869e50bf78e2f9185332c281f665fd53f6dbd7592df45e';

  // Alternative: also accept a plaintext token (config.gasToken)
  function getAcceptedToken() {
    return (window.PHYSCI_CONFIG && window.PHYSCI_CONFIG.gasToken) || '';
  }

  async function verify(token) {
    if (!token) return false;

    // 1. Check plaintext token first (fast path)
    if (getAcceptedToken() && token === getAcceptedToken()) {
      return true;
    }

    // 2. Fall back to SHA-256 hash comparison
    if (window.Security && typeof Security.sha256Hex === 'function') {
      try {
        const hash = await Security.sha256Hex(token);
        return hash === TEACHER_TOKEN_HASH;
      } catch (e) {
        console.warn('TeacherAuth.verify hash error:', e);
        return false;
      }
    }

    return false;
  }

  function save(teacher) {
    if (!teacher || !teacher.name) {
      throw new Error('Teacher name required');
    }
    const payload = Object.assign({}, teacher, {
      loggedInAt: teacher.loggedInAt || new Date().toISOString()
    });
    return Store.setTeacher(payload);
  }

  function get() {
    return (window.Store && Store.getTeacher()) || null;
  }

  function isLoggedIn() {
    const t = get();
    return !!(t && t.name);
  }

  function teacherHubPath() {
    const path = window.location.pathname;
    if (path.includes('/teacher/')) return '../instructor.html';
    return 'instructor.html';
  }

  function teacherLoginPath() {
    const path = window.location.pathname;
    if (path.includes('/teacher/') || path.includes('/classrecord/')) return '../teacher-login.html';
    return 'teacher-login.html';
  }

  function logout() {
    Store.clearTeacher();
    window.location.href = teacherLoginPath();
  }

  function requireTeacher() {
    if (!isLoggedIn()) {
      window.location.href = teacherLoginPath();
      return null;
    }
    return get();
  }

  return {
    verify,
    save,
    get,
    isLoggedIn,
    logout,
    requireTeacher,
    teacherHubPath,
    teacherLoginPath,
    TEACHER_TOKEN_HASH
  };
})();
