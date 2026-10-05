/* ============================================================
   teacher-auth.js — Physical Science · Teacher Authentication
   Version: 2.0.0
   ============================================================ */

window.TeacherAuth = (function () {
  'use strict';

  // ---- THE TEACHER TOKEN (change this to anything you want) ----
  const TEACHER_TOKEN = 'teacher2026';

  // ------------------------------------------------------------
  // verify(token) — returns true if the token matches
  // ------------------------------------------------------------
  async function verify(token) {
    if (!token) return false;
    return String(token).trim() === TEACHER_TOKEN;
  }

  // ------------------------------------------------------------
  // save(teacher) — store teacher session
  // ------------------------------------------------------------
  function save(teacher) {
    if (!teacher || !teacher.name) throw new Error('Teacher name required');
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
    TEACHER_TOKEN
  };
})();
