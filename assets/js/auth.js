/* ============================================================
   auth.js — Physical Science · Student Authentication
   Version: 1.0.0
   Depends on: config.js, store.js
   ============================================================ */

window.Auth = (function () {
  'use strict';

  const SESSION_TIMEOUT_MIN = 12 * 60; // 12 hours

  function loginPath() {
    const path = window.location.pathname;
    if (path.includes('/student/')) return 'login.html';
    return 'student/login.html';
  }

  function dashboardPath() {
    const path = window.location.pathname;
    if (path.includes('/student/')) return 'dashboard.html';
    return 'student/dashboard.html';
  }

  function getStudent() {
    return (window.Store && Store.getStudent()) || null;
  }

  function isLoggedIn() {
    const s = getStudent();
    if (!s || !s.lrn) return false;
    // Session timeout check
    if (s.loggedInAt) {
      const age = (Date.now() - new Date(s.loggedInAt).getTime()) / 60000;
      if (age > SESSION_TIMEOUT_MIN) {
        logout();
        return false;
      }
    }
    return true;
  }

  function login(student) {
    if (!student || !student.lrn) {
      throw new Error('Invalid student data');
    }
    const payload = Object.assign({}, student, {
      loggedInAt: new Date().toISOString()
    });
    return Store.setStudent(payload);
  }

  function logout() {
    Store.clearStudent();
    window.location.href = loginPath();
  }

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
    isLoggedIn,
    login,
    logout,
    requireStudent,
    getStudent,
    refreshSession,
    loginPath,
    dashboardPath
  };
})();
